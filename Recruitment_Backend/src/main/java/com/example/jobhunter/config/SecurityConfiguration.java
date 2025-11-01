package com.example.jobhunter.config;

import java.nio.charset.StandardCharsets;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.web.AuthorizationRequestRepository;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.web.util.UriComponentsBuilder;

// ✅ THÊM: Import class tiện ích (sẽ tạo ở file 5)
import com.example.jobhunter.util.*;
import com.example.jobhunter.domain.User;
import com.example.jobhunter.dto.response.ResLoginDTO;
import com.example.jobhunter.service.AuthService;
import com.example.jobhunter.service.UserService;
import com.example.jobhunter.util.error.SecurityUtil;
import com.nimbusds.jose.jwk.source.ImmutableSecret;
import com.nimbusds.jose.util.Base64;

@Configuration
@EnableMethodSecurity(securedEnabled = true)
public class SecurityConfiguration {

    @Value("${hoan.jwt.base64-secret}")
    private String jwtKey;

    // ✅ Dùng đúng key cho refresh token expiration
    @Value("${hoan.jwt.refresh-token-validity-in-seconds}")
    private long refreshTokenExpiration;

    // ✅ Lấy URL của frontend từ application.properties
    @Value("${hoan.frontend.url}")
    private String frontendUrl;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain fillterChain(HttpSecurity http,
            // ✅ THÊM: Inject các handler và repository
            AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler,
            AuthenticationFailureHandler oAuth2AuthenticationFailureHandler,
            AuthorizationRequestRepository<OAuth2AuthorizationRequest> cookieAuthorizationRequestRepository)
            throws Exception {
        http
                .csrf(c -> c.disable())
                .cors(Customizer.withDefaults())
                .authorizeHttpRequests(authz -> authz
                        .requestMatchers(
                                "/uploads/**",
                                "/api/v1/auth/**",
                                // ... (tất cả các path cũ của bạn)
                                "/api/v1/career-expectations/**",
                                "/api/v1/jobs/**",
                                "/api/v1/chat/**",
                                "/api/v1/files/**",
                                "/api/v1/users/**",
                                "/api/v1/portfolio/**",
                                "/api/v1/experiences/**",
                                "/api/v1/skills/**",
                                "/api/v1/educations/**",
                                "/users/**",
                                "/actuator/**",
                                "/companys/**",
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/ws/**",
                                "/error",
                                "/",
                                // ✅ THÊM: Cho phép các endpoint của OAuth2
                                "/oauth2/**")
                        .permitAll()
                        .anyRequest().authenticated())

                // ✅ THÊM: Cấu hình OAuth2 Login
                .oauth2Login(oauth2 -> oauth2
                        .authorizationEndpoint(authz -> authz
                                // URL để bắt đầu flow OAuth2
                                .baseUri("/oauth2/authorize")
                                // Dùng cookie repository thay vì session (quan trọng)
                                .authorizationRequestRepository(cookieAuthorizationRequestRepository))
                        .redirectionEndpoint(r -> r
                                // URL callback mà Google sẽ gọi về
                                .baseUri("/api/v1/auth/oauth2/callback/*"))
                        // Handler khi thành công (tạo JWT)
                        .successHandler(oAuth2AuthenticationSuccessHandler)
                        // Handler khi thất bại
                        .failureHandler(oAuth2AuthenticationFailureHandler))

                .oauth2ResourceServer((oauth2) -> oauth2.jwt(Customizer.withDefaults()))
                .formLogin(f -> f.disable())
                // ✅ Đảm bảo app là STATELESS
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        return http.build();
    }

    // @FunctionalInterface
    @Bean
    public JwtDecoder jwtDecoder() {
        NimbusJwtDecoder jwtDecoder = NimbusJwtDecoder.withSecretKey(getSecretKey())
                .macAlgorithm(SecurityUtil.JWT_ALGORITHM).build();
        return token -> {
            try {
                return jwtDecoder.decode(token);
            } catch (Exception e) {
                System.out.println(">>> JWT error: " + e.getMessage());
                throw e;
            }
        };
    }

    @Bean
    public JwtEncoder jwtEncoder() {
        return new NimbusJwtEncoder(new ImmutableSecret<>(getSecretKey()));
    }

    private SecretKey getSecretKey() {
        byte[] keyBytes = Base64.from(jwtKey).decode();
        return new SecretKeySpec(keyBytes, 0, keyBytes.length, SecurityUtil.JWT_ALGORITHM.getName());
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter grantedAuthenticationConverter = new JwtGrantedAuthoritiesConverter();
        grantedAuthenticationConverter.setAuthorityPrefix("");
        grantedAuthenticationConverter.setAuthoritiesClaimName("permission");

        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(grantedAuthenticationConverter);
        return jwtAuthenticationConverter;

    }

    // === ✅ CÁC BEAN MỚI CHO OAUTH2 ===

    /**
     * Repository lưu trữ OAuth2AuthorizationRequest trong cookie
     * thay vì HttpSession để hỗ trợ stateless.
     */
    @Bean
    public AuthorizationRequestRepository<OAuth2AuthorizationRequest> cookieAuthorizationRequestRepository() {
        // Class này bạn phải tự tạo (xem file 5)
        return new HttpCookieOAuth2AuthorizationRequestRepository();
    }

    /**
     * Handler xử lý khi login OAuth2 thành công.
     * Đây là nơi tích hợp: Sẽ tạo/cập nhật user,
     * sau đó gọi logic tạo JWT và set cookie y hệt như login thường.
     */
    @Bean
    public AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler(
            UserService userService,
            AuthService authService,
            SecurityUtil securityUtil) {
        return (request, response, authentication) -> {
            // ✅ SỬA LỖI: Dùng OAuth2User thay vì OidcUser để hỗ trợ cả OIDC (Google) và
            // OAuth2 (GitHub)
            OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();

            // ✅ Lấy email từ attributes (tên thuộc tính có thể khác nhau giữa providers)
            String email = oauth2User.getAttribute("email");

            // ✅ Lấy name, xử lý các providers khác nhau
            String name = oauth2User.getAttribute("name"); // Google, Facebook có "name"

            // ✅ XỬ LÝ: GitHub không có "name", dùng "login" (username) thay thế
            if (name == null || name.isEmpty()) {
                name = oauth2User.getAttribute("login"); // GitHub dùng "login"
                if (name == null || name.isEmpty()) {
                    // Fallback cuối cùng: lấy từ email
                    if (email != null && !email.isEmpty()) {
                        name = email.split("@")[0];
                    } else {
                        name = "User"; // Fallback mặc định
                    }
                }
            }

            // ✅ XỬ LÝ: Kiểm tra email có tồn tại không (GitHub user có thể ẩn email)
            if (email == null || email.isEmpty()) {
                String redirectUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/login")
                        .queryParam("error",
                                "Email not available. Please make your email public in your provider settings.")
                        .encode(StandardCharsets.UTF_8)
                        .build().toUriString();
                HttpCookieOAuth2AuthorizationRequestRepository.removeAuthorizationRequestCookies(request, response);
                response.sendRedirect(redirectUrl);
                return;
            }

            // 1. Tìm hoặc tạo user
            User user = userService.handleGetUserByEmail(email);
            if (user == null) {
                // Dùng AuthService để tạo user OAuth mới (xem file 4)
                user = authService.registerOauthUser(email, name);
            }

            // 2. Tạo DTO và Tokens (Dùng lại logic của bạn)
            ResLoginDTO res = new ResLoginDTO();
            ResLoginDTO.UserLogin userLogin = new ResLoginDTO.UserLogin(
                    user.getId(),
                    user.getEmail(),
                    user.getName());
            res.setUser(userLogin);

            // ✅ GỌI LOGIC TẠO TOKEN HIỆN TẠI CỦA BẠN
            String accessToken = securityUtil.createAccessToken(email, res.getUser());
            res.setAccessToken(accessToken);

            // ✅ GỌI LOGIC TẠO REFRESH TOKEN HIỆN TẠI CỦA BẠN
            String refreshToken = securityUtil.createRefreshToken(email, res);
            userService.updateUserToken(refreshToken, email);

            // 3. Tạo Refresh Token Cookie (Dùng lại logic của bạn)
            ResponseCookie refreshCookie = ResponseCookie
                    .from("refresh_token", refreshToken)
                    .httpOnly(true)
                    .secure(true) // Set false nếu dev không có HTTPS
                    .path("/")
                    .maxAge(refreshTokenExpiration) // Dùng giá trị từ properties
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

            // 4. Build Redirect URI về frontend
            String redirectUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/login")
                    .queryParam("oauth", "success")
                    .queryParam("provider", "google")
                    .queryParam("email", user.getEmail())
                    .queryParam("name", user.getName())
                    .queryParam("access_token", accessToken) // Gửi luôn access_token về
                    .encode(StandardCharsets.UTF_8) // ✅ THÊM DÒNG NÀY fix utf-8 url
                    .build().toUriString();

            // Xóa cookie tạm thời dùng cho flow OAuth2
            HttpCookieOAuth2AuthorizationRequestRepository.removeAuthorizationRequestCookies(request, response);

            response.sendRedirect(redirectUrl);
        };
    }

    /**
     * Handler xử lý khi login OAuth2 thất bại.
     */
    @Bean
    public AuthenticationFailureHandler oAuth2AuthenticationFailureHandler() {
        return (request, response, exception) -> {
            String errorMessage = "OAuth2 login failed: " + exception.getLocalizedMessage();

            // Redirect về trang login của frontend với thông báo lỗi
            String redirectUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/login")
                    .queryParam("error", errorMessage)
                    .build().toUriString();

            // Xóa cookie tạm thời
            HttpCookieOAuth2AuthorizationRequestRepository.removeAuthorizationRequestCookies(request, response);

            response.sendRedirect(redirectUrl);
        };
    }
}
