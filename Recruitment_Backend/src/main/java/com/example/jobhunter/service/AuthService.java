package com.example.jobhunter.service;

import com.example.jobhunter.domain.User;
import com.example.jobhunter.dto.request.ReqRegisterDTO;
import com.example.jobhunter.dto.response.ResLoginDTO;
import com.example.jobhunter.util.error.IdInvalidException;
import com.example.jobhunter.util.error.SecurityUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserService userService;
    private final SecurityUtil securityUtil;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserService userService,
            SecurityUtil securityUtil,
            AuthenticationManager authenticationManager,
            PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.securityUtil = securityUtil;
        this.authenticationManager = authenticationManager;
        this.passwordEncoder = passwordEncoder;
    }

    public User register(ReqRegisterDTO reqRegisterDTO) throws IdInvalidException {
        if (this.userService.isEmailExist(reqRegisterDTO.getEmail())) {
            throw new IdInvalidException("Email đã tồn tại. Vui lòng sử dụng email khác.");
        }

        String hashedPassword = this.passwordEncoder.encode(reqRegisterDTO.getPassword());

        User newUser = new User();
        newUser.setName(reqRegisterDTO.getName());
        newUser.setEmail(reqRegisterDTO.getEmail());
        newUser.setPassWord(hashedPassword);
        return this.userService.handleSaveUser(newUser);
    }

    // ✅ THÊM PHƯƠNG THỨC MỚI NÀY
    /**
     * Đăng ký một user mới từ OAuth2.
     * Vì họ không có password, nên ta tạo một password ngẫu nhiên.
     */
    public User registerOauthUser(String email, String name) {
        if (this.userService.isEmailExist(email)) {
            return this.userService.handleGetUserByEmail(email);
        }

        String randomPassword = "123456";
        String hashedPassword = this.passwordEncoder.encode(randomPassword);

        User newUser = new User();
        newUser.setName(name);
        newUser.setEmail(email);
        newUser.setPassWord(hashedPassword);

        return this.userService.handleSaveUser(newUser);
    }

    public ResLoginDTO login(String username, String password) {
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(username,
                password);
        Authentication authentication = authenticationManager.authenticate(authenticationToken);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        User currentUser = this.userService.handleGetUserByEmail(username);
        ResLoginDTO.UserLogin userLogin = new ResLoginDTO.UserLogin(
                currentUser.getId(),
                currentUser.getEmail(),
                currentUser.getName());

        ResLoginDTO res = new ResLoginDTO();
        res.setUser(userLogin);
        String accessToken = this.securityUtil.createAccessToken(authentication.getName(), res.getUser());
        res.setAccessToken(accessToken);

        String refreshToken = this.securityUtil.createRefreshToken(username, res);
        this.userService.updateUserToken(refreshToken, username);

        return res;
    }
}
