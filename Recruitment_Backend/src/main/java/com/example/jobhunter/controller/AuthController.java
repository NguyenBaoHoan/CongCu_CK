package com.example.jobhunter.controller;

import org.springframework.web.bind.annotation.RestController;

import com.example.jobhunter.dto.request.ReqRegisterDTO;
import com.example.jobhunter.service.AuthService;

import com.example.jobhunter.domain.User;
import com.example.jobhunter.dto.request.ReqLoginDTO;
import com.example.jobhunter.dto.response.ResLoginDTO;
import com.example.jobhunter.service.UserService;
import com.example.jobhunter.util.anotation.ApiMessage;
import com.example.jobhunter.util.error.IdInvalidException;
import com.example.jobhunter.util.error.SecurityUtil;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private UserService userService;
    private final AuthService authService;

    @Value("${hoan.jwt.access-token-validity-in-seconds}")
    private long refreshTokenExpiration;

    public AuthController(
            SecurityUtil securityUtil,
            UserService userService,
            AuthService authService) {
        this.userService = userService;
        this.authService = authService;
    }

    @PostMapping("/register")
    @ApiMessage("Tạo người dùng mới")
    public ResponseEntity<User> register(@Valid @RequestBody ReqRegisterDTO reqRegisterDTO) throws IdInvalidException {
        User newUser = this.authService.register(reqRegisterDTO);
        return ResponseEntity.ok(newUser);
    }

    @PostMapping("/login")
    public ResponseEntity<ResLoginDTO> login(@Valid @RequestBody ReqLoginDTO loginDTO) {
        ResLoginDTO res = authService.login(loginDTO.getUserName(), loginDTO.getPassWord());

        ResponseCookie refreshCookie = ResponseCookie
                .from("refresh_token", res.getRefreshToken())
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(refreshTokenExpiration)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(res);
    }

    @GetMapping("/account")
    @ApiMessage("fetch account")
    public ResponseEntity<ResLoginDTO.UserLogin> getAccount() {
        String email = SecurityUtil.getCurrentUserLogin().isPresent() ? SecurityUtil.getCurrentUserLogin().get()
                : "";

        User currentUserDB = this.userService.handleGetUserByEmail(email);
        ResLoginDTO.UserLogin userLogin = new ResLoginDTO.UserLogin();
        if (currentUserDB != null) {
            userLogin.setId(currentUserDB.getId());
            userLogin.setEmail(currentUserDB.getEmail());
            userLogin.setName(currentUserDB.getName());

        }

        return ResponseEntity.ok().body(userLogin);
    }

    @GetMapping("/refresh")
    public ResponseEntity<ResLoginDTO> getRefreshToken(
            @CookieValue(name = "refresh_token", defaultValue = "abc") String refreshToken)
            throws IdInvalidException {

        if (refreshToken == null || refreshToken.equals("abc") || refreshToken.isEmpty()) {
            throw new IdInvalidException("Bạn chưa có refresh token trong cookie");
        }

        ResLoginDTO res = authService.handleRefreshToken(refreshToken);
        if (res == null) {
            throw new IdInvalidException("Refresh Token không hợp lệ hoặc user không tồn tại");
        }

        ResponseCookie refreshCookie = ResponseCookie
                .from("refresh_token", res.getRefreshToken())
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(refreshTokenExpiration)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(res);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() throws IdInvalidException {

        String email = SecurityUtil.getCurrentUserLogin().isPresent() ? SecurityUtil.getCurrentUserLogin().get() : "";
        if (email.equals("")) {
            throw new IdInvalidException("Access Token không hợp lệ");
        }
        this.userService.updateUserToken(null, email);

        ResponseCookie deleteSpringCookie = ResponseCookie
                .from("refresh_token", null)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, deleteSpringCookie.toString())
                .body(null);
    }
}
