import { useState } from "react";
import AccountField from "../components/AccountField";
import { useContext } from "react";
import { CardContext } from "../context/CardContext";
import Cancel from "../components/Cancel";
export default function Acount() {
  const { user, setUser } = useContext(CardContext);
  const [isEdit, setIsEdit] = useState(false);
  const [data, setData] = useState(user);

  // Thay đổi các thông tinh khi chỉnh sửa
  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  // Thay đổi ảnh điện diện trong thông tin tài khoản
  const handleUploadAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "dat812");

      const rs = await fetch(
        "https://api.cloudinary.com/v1_1/dwbf4otd1/image/upload",
        {
          method: "POST",
          body: formData,
        }
      ).then((res) => res.json());

      if (rs.secure_url) {
        setData((prev) => ({ ...prev, img: rs.secure_url }));
      } else {
        alert("Upload ảnh thất bại");
      }
    } catch (err) {
      alert("Có lỗi khi upload ảnh");
    }
  };

  // Lưu thông tin sau thay đổi
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const rs = await fetch("https://shop-ll18.onrender.com/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: "Bearer " + token,
        },
        body: JSON.stringify(data),
      }).then((res) => res.json());

      setIsEdit(false);
      setData(rs.user);
      setUser(rs.user);
    } catch (err) {
      alert(err);
    }
  };
  return (
    <>
      <Cancel url="/" />
      <div className="h3 mt-3 mb-3 text-center fw-bold">TÀI KHOẢN CỦA TÔI</div>
      <div className="container">
        <div className="row border-md">
          <div className="col-12 col-md-4 d-flex justify-content-center align-items-center">
            <img
              src={
                data.img ||
                "https://i.pinimg.com/736x/bc/43/98/bc439871417621836a0eeea768d60944.jpg"
              }
              alt="avatar"
              className="border rounded-circle"
              style={{
                width: 120,
                height: 120,
                objectFit: "cover",
                cursor: "pointer",
              }}
              onClick={() => document.getElementById("avatarInput").click()}
            />

            <input
              id="avatarInput"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleUploadAvatar}
            />
          </div>

          <div className="col-12 col-md-8 p-3 mt-3">
            <div className="fw-bold">
              <AccountField
                label="Tên"
                value={data.name}
                name="name"
                onChange={handleChange}
                isEdit={isEdit}
              />
              <AccountField
                label="Email"
                value={data.email}
                name="email"
                onChange={handleChange}
                isEdit={isEdit}
              />
              <AccountField
                label="Điện thoại"
                value={data.phone}
                name="phone"
                onChange={handleChange}
                isEdit={isEdit}
              />
              <AccountField
                label="Địa chỉ"
                value={data.address}
                name="address"
                onChange={handleChange}
                isEdit={isEdit}
              />

              <div className="text-end">
                <button
                  className={`btn ${
                    !isEdit ? "btn-dark" : "btn-light border border-dark"
                  }`}
                  onClick={isEdit ? handleSave : () => setIsEdit(true)}
                >
                  {!isEdit ? "Chỉnh sửa thông tin" : "Lưu thông tin"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
