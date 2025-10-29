package com.example.jobhunter.config;

import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import com.example.jobhunter.domain.User;
import com.example.jobhunter.dto.response.ResLoginDTO;
import com.example.jobhunter.service.AuthService;
import com.example.jobhunter.service.UserService;
import com.example.jobhunter.util.HttpCookieOAuth2AuthorizationRequestRepository;
import com.example.jobhunter.util.error.SecurityUtil;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Handler xử lý khi login OAuth2 thành công.
 * Đây là nơi tích hợp: Sẽ tạo/cập nhật user,
 * sau đó gọi logic tạo JWT và set cookie y hệt như login thường.
 */
@Component
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final UserService userService;
    private final AuthService authService;
    private final SecurityUtil securityUtil;

    @Value("${hoan.jwt.refresh-token-validity-in-seconds}")
    private long refreshTokenExpiration;

    @Value("${hoan.frontend.url}")
    private String frontendUrl;

    public OAuth2AuthenticationSuccessHandler(UserService userService, AuthService authService,
            SecurityUtil securityUtil) {
        this.userService = userService;
        this.authService = authService;
        this.securityUtil = securityUtil;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) {
        try {
            OidcUser oidcUser = (OidcUser) authentication.getPrincipal();
            String email = oidcUser.getEmail();
            String name = oidcUser.getFullName();

            User user = userService.handleGetUserByEmail(email);
            if (user == null) {
                user = authService.registerOauthUser(email, name);
            }

            ResLoginDTO res = new ResLoginDTO();
            ResLoginDTO.UserLogin userLogin = new ResLoginDTO.UserLogin(
                    user.getId(),
                    user.getEmail(),
                    user.getName());
            res.setUser(userLogin);

            String accessToken = securityUtil.createAccessToken(email, res.getUser());
            res.setAccessToken(accessToken);

            String refreshToken = securityUtil.createRefreshToken(email, res);
            userService.updateUserToken(refreshToken, email);

            ResponseCookie refreshCookie = ResponseCookie
                    .from("refresh_token", refreshToken)
                    .httpOnly(true)
                    .secure(true)
                    .path("/")
                    .maxAge(refreshTokenExpiration)
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

            String redirectUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/login")
                    .queryParam("oauth", "success")
                    .queryParam("provider", "google")
                    .queryParam("email", user.getEmail())
                    .queryParam("name", user.getName())
                    .queryParam("access_token", accessToken)
                    .encode(StandardCharsets.UTF_8)
                    .build().toUriString();

            HttpCookieOAuth2AuthorizationRequestRepository.removeAuthorizationRequestCookies(request, response);

            response.sendRedirect(redirectUrl);
        } catch (Exception e) {
            throw new RuntimeException("OAuth2 success handler error: " + e.getMessage(), e);
        }
    }
}
