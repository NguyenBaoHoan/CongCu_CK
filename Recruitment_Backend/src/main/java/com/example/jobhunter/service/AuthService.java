package com.example.jobhunter.service;

import com.example.jobhunter.domain.User;
import com.example.jobhunter.dto.request.ReqRegisterDTO;
import com.example.jobhunter.dto.response.ResLoginDTO;
import com.example.jobhunter.util.error.IdInvalidException;
import com.example.jobhunter.util.error.SecurityUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Arrays;
import java.util.List;

@Service
public class AuthService {
    private final UserService userService;
    private final SecurityUtil securityUtil;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserService userService,
            SecurityUtil securityUtil,
            AuthenticationManager authenticationManager,
            PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.securityUtil = securityUtil;
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

        User currentUser = userService.handleGetUserByEmail(username);
        if (currentUser == null) {
            throw new UsernameNotFoundException("User not found with username: " + username);
        }

        if (!passwordEncoder.matches(password, currentUser.getPassWord())) {
            throw new BadCredentialsException("Invalid password");
        }

        ResLoginDTO.UserLogin userLogin = new ResLoginDTO.UserLogin(
                currentUser.getId(),
                currentUser.getEmail(),
                currentUser.getName());

        ResLoginDTO res = new ResLoginDTO();
        res.setUser(userLogin);

        String accessToken = securityUtil.createAccessToken(username, userLogin);
        String refreshToken = securityUtil.createRefreshToken(username, res);
        res.setAccessToken(accessToken);
        res.setRefreshToken(refreshToken);


        userService.updateUserToken(refreshToken, username);

        List<GrantedAuthority> authorities = Arrays.asList(new SimpleGrantedAuthority("ROLE_USER"));
        Authentication authentication = new UsernamePasswordAuthenticationToken(username, null, authorities);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        return res;
    }

        /**
     * Xử lý logic refresh token: kiểm tra token, lấy user, tạo access token và refresh token mới, cập nhật DB, trả về DTO
     */
    public ResLoginDTO handleRefreshToken(String refreshToken) {
        try {
            // Kiểm tra token hợp lệ
            org.springframework.security.oauth2.jwt.Jwt decodedToken = securityUtil.checkValidRefreshToken(refreshToken);
            String email = decodedToken.getSubject();

            // Kiểm tra user với token và email
            User currentUser = userService.getUserByRefreshTokenAndEmail(refreshToken, email);
            if (currentUser == null) {
                return null;
            }

            // Lấy thông tin user
            User userDB = userService.handleGetUserByEmail(email);
            if (userDB == null) {
                return null;
            }

            ResLoginDTO.UserLogin userLogin = new ResLoginDTO.UserLogin(
                    userDB.getId(),
                    userDB.getEmail(),
                    userDB.getName()
            );

            ResLoginDTO res = new ResLoginDTO();
            res.setUser(userLogin);

            // Tạo access token mới
            String accessToken = securityUtil.createAccessToken(email, userLogin);
            res.setAccessToken(accessToken);

            // Tạo refresh token mới
            String newRefreshToken = securityUtil.createRefreshToken(email, res);
            res.setRefreshToken(newRefreshToken);

            // Cập nhật refresh token vào DB
            userService.updateUserToken(newRefreshToken, email);

            return res;
        } catch (Exception e) {
            return null;
        }
    }

}
