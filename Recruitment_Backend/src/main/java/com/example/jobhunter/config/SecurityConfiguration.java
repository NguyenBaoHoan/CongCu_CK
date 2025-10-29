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

    @Value("${hoan.jwt.refresh-token-validity-in-seconds}")
    private long refreshTokenExpiration;

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
                                "/oauth2/**")
                        .permitAll()
                        .anyRequest().authenticated())

                .oauth2Login(oauth2 -> oauth2
                        .authorizationEndpoint(authz -> authz
                                .baseUri("/oauth2/authorize")
                                .authorizationRequestRepository(cookieAuthorizationRequestRepository))
                        .redirectionEndpoint(r -> r
                                .baseUri("/api/v1/auth/oauth2/callback/*"))
                        .successHandler(oAuth2AuthenticationSuccessHandler)
                        .failureHandler(oAuth2AuthenticationFailureHandler))

                .oauth2ResourceServer((oauth2) -> oauth2.jwt(Customizer.withDefaults()))
                .formLogin(f -> f.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        return http.build();
    }

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

    @Bean
    public AuthorizationRequestRepository<OAuth2AuthorizationRequest> cookieAuthorizationRequestRepository() {
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
                    .secure(true) // Set false nếu dev không có HTTPS
                    .path("/")
                    .maxAge(refreshTokenExpiration) // Dùng giá trị từ properties
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
        };
    }

    /**
     * Handler xử lý khi login OAuth2 thất bại.
     */
    @Bean
    public AuthenticationFailureHandler oAuth2AuthenticationFailureHandler() {
        return (request, response, exception) -> {
            String errorMessage = "OAuth2 login failed: " + exception.getLocalizedMessage();

            String redirectUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/login")
                    .queryParam("error", errorMessage)
                    .build().toUriString();

            HttpCookieOAuth2AuthorizationRequestRepository.removeAuthorizationRequestCookies(request, response);

            response.sendRedirect(redirectUrl);
        };
    }
}
