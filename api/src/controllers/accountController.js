const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Account = require('../models/Account');

const isProd = process.env.NODE_ENV === 'production';

// Cấu hình cookie chung
const cookieOptions = {
  httpOnly: true,
  secure: isProd,         // bắt buộc HTTPS khi production
  sameSite: 'none',       // cho phép cross-site
  path: '/',              // toàn bộ domain
  domain: isProd ? undefined : 'localhost'
};

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

    // Clear cookie cũ
    res.clearCookie('token', cookieOptions);

    // Tạo JWT
    const token = jwt.sign(
      { userId: acc._id, role: acc.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Set cookie mới
    res.cookie('token', token, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 30 ngày
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

    const existingUser = await Account.findOne({ 
      $or: [{ login_name }, { email }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Tài khoản hoặc email đã tồn tại' });
    }

    const count = await Account.countDocuments();
    const isFirstAccount = count === 0;
    const role = isFirstAccount ? 'admin' : 'user';
    
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

// Lấy thông tin user
const getMe = async (req, res) => {
  try {
    const user = await Account.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    res.json({
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
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy tất cả tài khoản
const getAllAccounts = async (req, res) => {
  try {
    const accounts = await Account.find().select('-password');
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy account theo ID
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

// Reset mật khẩu
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
    const { latestSong } = req.body;
    
    const updatedUser = await Account.findByIdAndUpdate(
      userId, 
      { latedSong: latestSong }, 
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

// Cập nhật danh sách yêu thích
const updatefavSong = async (req, res) => {
  try {
    const { id } = req.params;
    const { songId } = req.body;
    
    const user = await Account.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    let favSong = user.favSong || [];
    if (favSong.includes(songId)) {
      favSong = favSong.filter(i => i.toString() !== songId.toString());
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

// Cập nhật profile
const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email } = req.body;

    if (!username?.trim() || !email?.trim()) {
      return res.status(400).json({ message: 'Username và email không được để trống' });
    }

    const user = await Account.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const existingEmail = await Account.findOne({ email: email.trim(), _id: { $ne: id } });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email này đã được sử dụng bởi tài khoản khác' });
    }

    const existingUsername = await Account.findOne({ username: username.trim(), _id: { $ne: id } });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username này đã được sử dụng bởi tài khoản khác' });
    }

    const updateData = { username: username.trim(), email: email.trim() };

    if (req.file) {
      if (user.avt && !user.avt.startsWith('/default')) {
        try {
          const { deleteFromCloudinary } = require('../utils/cloudinaryReal');
          await deleteFromCloudinary(user.avt);
        } catch {}
      }

      try {
        const { uploadToCloudinary } = require('../utils/cloudinaryReal');
        const avtResult = await uploadToCloudinary(req.file, 'avt');
        updateData.avt = avtResult.url;
      } catch (err) {
        return res.status(500).json({ message: 'Lỗi khi upload avatar: ' + err.message });
      }
    }

    const updatedUser = await Account.findByIdAndUpdate(
      id, updateData, { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Cập nhật thông tin thành công',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi cập nhật thông tin: ' + error.message });
  }
};

// Cập nhật mật khẩu
const updatePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới' });
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
    res.status(500).json({ message: 'Lỗi server khi cập nhật mật khẩu: ' + error.message });
  }
};

// Đăng xuất
const logout = async (req, res) => {
  try {
    res.clearCookie('token', cookieOptions);
    res.json({ message: 'Đăng xuất thành công' });
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
