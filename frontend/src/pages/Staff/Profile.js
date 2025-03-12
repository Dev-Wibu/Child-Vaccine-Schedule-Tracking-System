import React, { useState, useEffect } from "react";
import { FaNotesMedical, FaSyringe, FaUserMd } from "react-icons/fa";
import { FiCalendar, FiUsers, FiAlertTriangle } from "react-icons/fi";
import { useAuth } from '../../components/AuthContext';  
import '../../style/Profile.css';

const StaffProfile = ({ initialStaffData }) => {
  const [staffData, setStaffData] = useState(initialStaffData);
  const [originalData, setOriginalData] = useState(initialStaffData);
  const [formData, setFormData] = useState(initialStaffData);
  const [formChanged, setFormChanged] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    setStaffData(initialStaffData);
    setOriginalData(initialStaffData);
    setFormData(initialStaffData);
  }, [initialStaffData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);
    const changed = Object.keys(updatedData).some((key) => {
      if (key === "staffId" || key === "roleId" || key === "active")
        return false;
      return updatedData[key] !== originalData[key];
    });
    setFormChanged(changed);
  };

  const handleSave = async () => {
    try {
      const response = await fetch("http://localhost:8080/staff/update", {
        method: "POST",
        credentials: "include",
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Lỗi khi cập nhật thông tin");
      const updatedData = await response.json();
      setStaffData(updatedData);
      setOriginalData(updatedData);
      setFormChanged(false);
      setNotification({ type: "success", message: "Cập nhật thành công!" });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({ type: "error", message: "Cập nhật thất bại!" });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  if (!formData) return null;

  return (
    <div className="staff-profile-container-profilestaffcss">
      <h2 className="staff-profile-title-profilestaffcss">
        <FaUserMd className="staff-profile-icon-profilestaffcss" /> Hồ Sơ Nhân Viên
      </h2>
      {notification && (
        <div
          className={`staff-profile-notification-profilestaffcss ${notification.type === "success" ? "notification-success-profilestaffcss" : "notification-error-profilestaffcss"}`}
        >
          <span>{notification.message}</span>
        </div>
      )}
      <form className="staff-profile-form-profilestaffcss">
        <div className="staff-profile-grid-profilestaffcss">
          <div>
            <label className="staff-profile-label-profilestaffcss">Mã nhân viên</label>
            <input
              type="text"
              name="staffId"
              value={formData.staffId || ""}
              disabled
              className="staff-profile-input-profilestaffcss staff-profile-input-disabled-profilestaffcss"
            />
          </div>
          <div>
            <label className="staff-profile-label-profilestaffcss">Họ</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName || ""}
              onChange={handleChange}
              className="staff-profile-input-profilestaffcss"
            />
          </div>
          <div>
            <label className="staff-profile-label-profilestaffcss">Tên</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName || ""}
              onChange={handleChange}
              className="staff-profile-input-profilestaffcss"
            />
          </div>
          <div>
            <label className="staff-profile-label-profilestaffcss">Số điện thoại</label>
            <input
              type="text"
              name="phone"
              value={formData.phone || ""}
              onChange={handleChange}
              className="staff-profile-input-profilestaffcss"
            />
          </div>
          <div>
            <label className="staff-profile-label-profilestaffcss">Ngày sinh</label>
            <input
              type="date"
              name="dob"
              value={formData.dob || ""}
              onChange={handleChange}
              className="staff-profile-input-profilestaffcss"
            />
          </div>
          <div>
            <label className="staff-profile-label-profilestaffcss">Địa chỉ</label>
            <input
              type="text"
              name="address"
              value={formData.address || ""}
              onChange={handleChange}
              className="staff-profile-input-profilestaffcss"
            />
          </div>
          <div>
            <label className="staff-profile-label-profilestaffcss">Email</label>
            <input
              type="email"
              name="mail"
              value={formData.mail || ""}
              onChange={handleChange}
              className="staff-profile-input-profilestaffcss"
            />
          </div>
          <div>
            <label className="staff-profile-label-profilestaffcss">Giới tính</label>
            <select
              name="gender"
              value={formData.gender || ""}
              onChange={handleChange}
              className="staff-profile-input-profilestaffcss"
            >
              <option value="">Chọn giới tính</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>
          <div>
            <label className="staff-profile-label-profilestaffcss">Mật khẩu</label>
            <input
              type="password"
              name="password"
              value={formData.password || ""}
              onChange={handleChange}
              className="staff-profile-input-profilestaffcss"
            />
          </div>
        </div>
        <div className="staff-profile-button-container-profilestaffcss">
          <button
            type="button"
            onClick={handleSave}
            disabled={!formChanged}
            className={`staff-profile-save-btn-profilestaffcss ${formChanged ? "btn-active-profilestaffcss" : "btn-disabled-profilestaffcss"}`}
          >
            Lưu Thay Đổi
          </button>
        </div>
      </form>
    </div>
  );
};

const Profile = () => {
  const { userInfo } = useAuth();
  const staffId = userInfo.userId;

  const [staffData, setStaffData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!staffId) return;

    const fetchStaffData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:8080/staff/findid?id=${staffId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (!response.ok) throw new Error("Lỗi khi lấy dữ liệu nhân viên");
        const data = await response.json();
        setStaffData(data);
      } catch (error) {
        setError(error.message);
      }
      setLoading(false);
    };

    fetchStaffData();
  }, [staffId]);

  if (loading)
    return <div className="profile-loading-profilestaffcss">Đang tải dữ liệu...</div>;
  if (error) return <div className="profile-error-profilestaffcss">{error}</div>;
  if (!staffData)
    return <div className="profile-no-data-profilestaffcss">Không có dữ liệu</div>;

  return (
    <div className="profile-container-profilestaffcss">
      <div className="profile-content-profilestaffcss">
        <div className="profile-stats-profilestaffcss">
          <div className="profile-stat-card-profilestaffcss profile-stat-teal-profilestaffcss">
            <div className="profile-stat-icon-container-profilestaffcss">
              <FiCalendar className="profile-stat-icon-profilestaffcss" />
            </div>
            <div className="profile-stat-text-profilestaffcss">
              <p className="profile-stat-label-profilestaffcss">Lịch hẹn hôm nay</p>
              <p className="profile-stat-value-profilestaffcss">24</p>
            </div>
          </div>
          <div className="profile-stat-card-profilestaffcss profile-stat-green-profilestaffcss">
            <div className="profile-stat-icon-container-profilestaffcss">
              <FiUsers className="profile-stat-icon-profilestaffcss" />
            </div>
            <div className="profile-stat-text-profilestaffcss">
              <p className="profile-stat-label-profilestaffcss">Tổng bệnh nhân</p>
              <p className="profile-stat-value-profilestaffcss">1,248</p>
            </div>
          </div>
          <div className="profile-stat-card-profilestaffcss profile-stat-blue-profilestaffcss">
            <div className="profile-stat-icon-container-profilestaffcss">
              <FaSyringe className="profile-stat-icon-profilestaffcss" />
            </div>
            <div className="profile-stat-text-profilestaffcss">
              <p className="profile-stat-label-profilestaffcss">Vaccine có sẵn</p>
              <p className="profile-stat-value-profilestaffcss">32</p>
            </div>
          </div>
          <div className="profile-stat-card-profilestaffcss profile-stat-red-profilestaffcss">
            <div className="profile-stat-icon-container-profilestaffcss">
              <FiAlertTriangle className="profile-stat-icon-profilestaffcss" />
            </div>
            <div className="profile-stat-text-profilestaffcss">
              <p className="profile-stat-label-profilestaffcss">Báo cáo phản ứng</p>
              <p className="profile-stat-value-profilestaffcss">7</p>
            </div>
          </div>
        </div>

        {/* Luôn hiển thị StaffProfile mà không cần nút toggle */}
        <StaffProfile initialStaffData={staffData} />
      </div>
    </div>
  );
};

export default Profile;