/**
 * Validation functions cho form inputs
 * Giúp kiểm tra dữ liệu trước khi gửi lên server
 */

export const validators = {
    // Kiểm tra email hợp lệ
    isValidEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Kiểm tra password (tối thiểu 6 ký tự)
    isValidPassword: (password) => {
        return password && password.length >= 6;
    },

    // Kiểm tra password mạnh (có chữ hoa, chữ thường, số)
    isStrongPassword: (password) => {
        const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return strongRegex.test(password);
    },

    // Kiểm tra tên (không chứa số và ký tự đặc biệt)
    isValidName: (name) => {
        const nameRegex = /^[a-zA-ZÀ-ỹ\s]+$/;
        return name && nameRegex.test(name);
    },

    // Kiểm tra số điện thoại Việt Nam
    isValidPhone: (phone) => {
        const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
        return phoneRegex.test(phone);
    },

    // Kiểm tra field không rỗng
    isRequired: (value) => {
        return value && value.toString().trim().length > 0;
    }
};