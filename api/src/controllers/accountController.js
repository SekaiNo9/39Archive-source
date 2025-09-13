const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Account = require('../models/Account');

// Đăng nhập
const login = async (req, res) => {
  try {
    const { login_name, password } = req.body;

    if (!login_name || !password) {
      return res.status(400).json({ message: 'Thiếu thông tin' });
    }

    const acc = await Account.findOne({ login_name });
    if (!acc) {
      return res.status(401).json({ message: 'Sai tên đăng nhập hoặc mật khẩu' });
    }

    const isMatch = await bcrypt.compare(password, acc.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Sai tên đăng nhập hoặc mật khẩu' });
    }

    // Clear cookie cũ trước khi set cookie mới - với tất cả possible paths
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });
    
    // Clear cookie với domain nếu có
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost'
    });

    // Debug: Log environment và cookie settings
    console.log('🔍 Login - Environment:', process.env.NODE_ENV);
    console.log('🔍 Login - Cookie secure:', process.env.NODE_ENV === 'production');
    console.log('🔍 Login - User attempting:', login_name);

    // Tạo JWT
    const token = jwt.sign(
      { userId: acc._id, role: acc.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '30d' }
    );

    console.log('🔍 Login - Token created for userId:', acc._id, 'role:', acc.role);
    console.log('🔍 Login - Token payload:', { userId: acc._id, role: acc.role });
    
    // Decode token để verify
    const decoded = jwt.decode(token);
    console.log('🔍 Login - Token decoded check:', { userId: decoded.userId, role: decoded.role });

    // Gửi cookie HttpOnly mới
    console.log('🔍 Login - Setting cookie with token for user:', acc.login_name);
    console.log('🔍 Login - Cookie settings:', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30*24*60*60*1000,
      path: '/',
      domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost'
    });
    
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'lax',
        maxAge: 30*24*60*60*1000, // 30 ngày
        path: '/',
        domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost'
    });

    res.json({
      message: 'Đăng nhập thành công',
      account: {
        _id: acc._id,
        login_name: acc.login_name,
        username: acc.username,
        email: acc.email,
        role: acc.role,
        avatar: acc.avt || null
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Đăng ký
const register = async (req, res) => {
  try {
    const { login_name, username, password, email } = req.body;
    
    if (!login_name || !username || !password || !email) {
      return res.status(400).json({ message: 'Thiếu thông tin' });
    }

    // Kiểm tra user đã tồn tại
    const existingUser = await Account.findOne({ 
      $or: [{ login_name }, { email }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Tài khoản hoặc email đã tồn tại' });
    }

    // Kiểm tra nếu db trống => role admin
    const count = await Account.countDocuments();
    const isFirstAccount = count === 0;
    const role = isFirstAccount ? 'admin' : 'user';
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const acc = new Account({ 
      login_name, 
      username, 
      password: hashedPassword, 
      email, 
      role 
    });

    await acc.save();
    
    // Thông báo khác nhau cho admin và user thường
    const successMessage = isFirstAccount 
      ? 'Tạo tài khoản ADMIN đầu tiên thành công!' 
      : 'Tạo tài khoản thành công';
    
    res.status(201).json({ 
      message: successMessage, 
      account: { login_name, username, email, role },
      isAdmin: isFirstAccount
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Chỉ cần sửa hàm getMe

const getMe = async (req, res) => {
  try {
    // Debug: Log what we received from middleware
    console.log('🔍 getMe - req.userId:', req.userId);
    console.log('🔍 getMe - req.userRole:', req.userRole);
    
    // userId đã được set bởi middleware auth
    const user = await Account.findById(req.userId).select('-password');
    
    console.log('🔍 getMe - Found user:', user ? user.login_name : 'null');
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const responseData = {
      account: {
        _id: user._id,
        login_name: user.login_name,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avt || null,
        favSong: user.favSong || [],
        latedSong: user.latedSong || []
      }
    };
    
    console.log('🔍 getMe - Returning user:', responseData.account.login_name);
    
    res.json(responseData);
  } catch (err) {
    console.error('🔍 getMe - Error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

// Lấy tất cả tài khoản (admin)
const getAllAccounts = async (req, res) => {
  try {
    const accounts = await Account.find().select('-password');
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy thông tin tài khoản theo ID
const getAccountById = async (req, res) => {
  try {
    const { id } = req.params;
    const account = await Account.findById(id).select('-password');
    if (!account) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
    }
    res.json(account);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reset mật khẩu (admin)
const resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);
    
    await Account.findByIdAndUpdate(id, { password: hashedPassword });
    res.json({ message: 'Reset mật khẩu thành công' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Xóa tài khoản
const deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;
    await Account.findByIdAndDelete(id);
    res.json({ message: 'Xóa tài khoản thành công' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cập nhật bài hát gần đây
const updateLatestSong = async (req, res) => {
  try {
    const { userId } = req.params;
    const { latestSong } = req.body; // Đổi từ latestSongs thành latestSong
    
    const updatedUser = await Account.findByIdAndUpdate(
      userId, 
      { latedSong: latestSong }, // Đổi thành latedSong theo model
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    res.json({ 
      message: 'Cập nhật bài hát gần đây thành công',
      latedSong: updatedUser.latedSong
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cập nhật bài hát yêu thích
const updatefavSong = async (req, res) => {
  try {
    const { id } = req.params;
    const { songId } = req.body; // Chỉ cần songId, không phải favSongs array
    
    const user = await Account.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    let favSong = user.favSong || [];
    
    // Toggle: nếu đã có thì xóa, chưa có thì thêm
    if (favSong.includes(songId)) {
      favSong = favSong.filter(id => id.toString() !== songId.toString());
    } else {
      favSong.push(songId);
    }
    
    const updatedUser = await Account.findByIdAndUpdate(
      id, 
      { favSong }, 
      { new: true }
    ).select('-password');
    
    res.json({ 
      message: 'Cập nhật danh sách yêu thích thành công',
      favSong: updatedUser.favSong
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cập nhật thông tin cá nhân
const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email } = req.body;

    if (!username?.trim() || !email?.trim()) {
      return res.status(400).json({ 
        message: 'Username và email không được để trống' 
      });
    }

    const user = await Account.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const existingEmail = await Account.findOne({ 
      email: email.trim(), 
      _id: { $ne: id } 
    });
    if (existingEmail) {
      return res.status(400).json({ 
        message: 'Email này đã được sử dụng bởi tài khoản khác' 
      });
    }

    const existingUsername = await Account.findOne({ 
      username: username.trim(), 
      _id: { $ne: id } 
    });
    if (existingUsername) {
      return res.status(400).json({ 
        message: 'Username này đã được sử dụng bởi tài khoản khác' 
      });
    }

    const updateData = {
      username: username.trim(),
      email: email.trim()
    };

    if (req.file) {
      if (user.avt && !user.avt.startsWith('/default')) {
        try {
          const { deleteFromCloudinary } = require('../utils/cloudinaryReal');
          await deleteFromCloudinary(user.avt);
        } catch (err) {
          // Silently continue if deletion fails
        }
      }

      try {
        const { uploadToCloudinary } = require('../utils/cloudinaryReal');
        const avtResult = await uploadToCloudinary(req.file, 'avt');
        updateData.avt = avtResult.url;
      } catch (err) {
        return res.status(500).json({ 
          message: 'Lỗi khi upload avatar: ' + err.message 
        });
      }
    }

    const updatedUser = await Account.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Cập nhật thông tin thành công',
      user: updatedUser
    });

  } catch (error) {
    res.status(500).json({ 
      message: 'Lỗi server khi cập nhật thông tin: ' + error.message 
    });
  }
};

// Cập nhật mật khẩu
const updatePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: 'Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới' 
      });
    }

    const user = await Account.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
    }

    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    await Account.findByIdAndUpdate(id, { password: hashedNewPassword });

    res.json({ message: 'Cập nhật mật khẩu thành công' });

  } catch (error) {
    res.status(500).json({ 
      message: 'Lỗi server khi cập nhật mật khẩu: ' + error.message 
    });
  }
};

// Đăng xuất
const logout = async (req, res) => {
  try {
    // Clear cookie với tất cả possible configurations
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });
    
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost'
    });
    
    console.log('🔍 Logout - Cookies cleared');
    
    res.json({ 
      message: 'Đăng xuất thành công' 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllAccounts,
  getMe,
  login,
  logout,
  getAccountById,
  register,
  resetPassword,
  deleteAccount,
  updateLatestSong,
  updatefavSong,
  updateProfile,
  updatePassword
};
