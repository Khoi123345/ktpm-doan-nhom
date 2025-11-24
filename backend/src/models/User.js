import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const addressSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    district: {
        type: String,
        required: true,
    },
    isDefault: {
        type: Boolean,
        default: false,
    },
});

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Vui lòng nhập tên'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Vui lòng nhập email'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, 'Vui lòng nhập mật khẩu'],
            minlength: [8, 'Mật khẩu phải có ít nhất 8 ký tự'],
            select: false,
            validate: {
                validator: function (value) {
                    // Check for at least one uppercase letter
                    const hasUpperCase = /[A-Z]/.test(value);
                    // Check for at least one number
                    const hasNumber = /[0-9]/.test(value);
                    // Check for at least one special character
                    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

                    return hasUpperCase && hasNumber && hasSpecialChar;
                },
                message: 'Mật khẩu phải chứa ít nhất một chữ cái viết hoa, một số và một ký tự đặc biệt'
            }
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        avatar: {
            type: String,
            default: 'https://res.cloudinary.com/demo/image/upload/avatar-default.png',
        },
        phone: {
            type: String,
            default: '',
        },
        addresses: [addressSchema],
    },
    {
        timestamps: true,
    }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
