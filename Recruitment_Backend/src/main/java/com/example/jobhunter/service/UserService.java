// File: service/UserService.java
package com.example.jobhunter.service;

import com.example.jobhunter.domain.User;
import com.example.jobhunter.dto.response.ResCreateUserDTO;
import com.example.jobhunter.dto.response.ResUserDTO;
import com.example.jobhunter.dto.response.ResultPaginationDTO;
import com.example.jobhunter.repository.UserRepository;
import com.example.jobhunter.util.error.IdInvalidException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User handleSaveUser(User user) {
        return userRepository.save(user);
    }

    public boolean existsById(Long id) {
        return userRepository.existsById(id);
    }

    public void handleDeleteUser(long id) {
        userRepository.deleteById(id);
    }

    public User fetchOneUser(long id) {
        Optional<User> userOptional = userRepository.findById(id);
        if (userOptional.isPresent()) {
            return userOptional.get();
        }
        return null;
    }

    public ResultPaginationDTO fetchAllUser(Specification<User> spec, Pageable pageable) {
        Page<User> pageUser = this.userRepository.findAll(spec, pageable);
        ResultPaginationDTO rs = new ResultPaginationDTO();
        ResultPaginationDTO.Meta mt = new ResultPaginationDTO.Meta();

        mt.setPage(pageUser.getNumber() + 1);
        mt.setPageSize(pageUser.getSize());

        mt.setPages(pageUser.getTotalPages());
        mt.setTotal(pageUser.getTotalElements());

        rs.setMeta(mt);
        List<ResUserDTO> listUser = pageUser.getContent()
                .stream().map(item -> {
                    return new ResUserDTO(
                            item.getId(),
                            item.getName(),
                            item.getEmail(),
                            item.getGender(),
                            item.getAddress(),
                            item.getAge());
                })
                .collect(Collectors.toList());

        rs.setResult(listUser);

        return rs;
    }

    public User handleUpdateUser(User reqUser) {
        User currentUser = this.fetchOneUser(reqUser.getId());
        if (currentUser != null) {
            currentUser.setName(reqUser.getName());
            currentUser.setEmail(reqUser.getEmail());
            currentUser.setPassWord(reqUser.getPassWord());

            currentUser = userRepository.save(currentUser);
        }
        return currentUser;
    }

    public User handleGetUserByEmail(String username) {
        return this.userRepository.findByEmail(username);
    }

    public boolean isEmailExist(String username) {
        return userRepository.existsByEmail(username);
    }

    public ResCreateUserDTO convertToResCreateUserDTO(User user) {
        ResCreateUserDTO res = new ResCreateUserDTO();

        res.setId(user.getId());
        res.setEmail(user.getEmail());
        res.setName(user.getName());
        res.setAge(user.getAge());
        res.setGender(user.getGender());
        return res;
    }

    public ResUserDTO convertToResUserDTO(User user) {
        ResUserDTO res = new ResUserDTO();
        res.setId(user.getId());
        res.setEmail(user.getEmail());
        res.setName(user.getName());
        res.setAge(user.getAge());
        res.setGender(user.getGender());
        res.setAddress(user.getAddress());

        return res;
    }

    public void updateUserToken(String token, String email) {
        User currentUser = this.handleGetUserByEmail(email);
        if (currentUser != null) {
            currentUser.setRefreshToken(token);
            this.userRepository.save(currentUser);
        }
    }

    public User getUserByRefreshTokenAndEmail(String token, String email) {
        return this.userRepository.findByRefreshTokenAndEmail(token, email);
    }

    // <<< NEW METHOD ADDED >>>
    /**
     * Handles changing a user's password after verifying the old one.
     *
     * @param email       The email of the logged-in user.
     * @param oldPassword The user's current password.
     * @param newPassword The new password to set.
     * @throws IdInvalidException if the user is not found or the old password is
     *                            incorrect.
     */

    public void handleChangePassword(Long userId, String oldPassword, String newPassword) throws IdInvalidException {
        User currentUser = this.userRepository.findById(userId)
                .orElseThrow(() -> new IdInvalidException("Không tìm thấy người dùng với ID: " + userId));

        if (currentUser.getPassWord() == null ||
                !passwordEncoder.matches(oldPassword, currentUser.getPassWord())) {
            throw new IdInvalidException("Mật khẩu cũ không chính xác.");
        }

        currentUser.setPassWord(this.passwordEncoder.encode(newPassword));
        this.userRepository.save(currentUser);
    }
}
