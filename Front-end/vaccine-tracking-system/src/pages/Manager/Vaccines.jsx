import React, { useEffect, useState } from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";
import {
  FaSyringe,
  FaSearch,
  FaPlus,
  FaPowerOff,
  FaVial,
} from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Vaccines = () => {
  const [vaccines, setVaccines] = useState([]);
  const [searchType, setSearchType] = useState("name");
  const [searchValue, setSearchValue] = useState("");
  const [searchValueMin, setSearchValueMin] = useState("");
  const [searchValueMax, setSearchValueMax] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newVaccine, setNewVaccine] = useState({
    name: "",
    doseNumber: 0,
    price: 0,
    description: "",
    country: "",
    ageMin: 0,
    ageMax: 0,
    active: true,
  });
  const [newVaccineError, setNewVaccineError] = useState(null);

  // Fetch vaccines từ API
  const fetchVaccines = () => {
    axios
      .get("http://localhost:8080/vaccine", {
        withCredentials: true,
      })
      .then((res) => {
        console.log("Fetch vaccines success:", res.data);
        setVaccines(res.data);
      })
      .catch((err) => console.error("Lỗi:", err));
  };

  useEffect(() => {
    fetchVaccines();
  }, []);

  const filteredVaccines = vaccines.filter((vaccine) => {
    let matchesSearch = true;
    if (searchType === "name") {
      matchesSearch = vaccine.name
        .toLowerCase()
        .includes(searchValue.toLowerCase());
    } else if (searchType === "price") {
      const price = Number(vaccine.price);
      const minPrice = searchValueMin ? Number(searchValueMin) : -Infinity;
      const maxPrice = searchValueMax ? Number(searchValueMax) : Infinity;
      matchesSearch = price >= minPrice && price <= maxPrice;
    } else if (searchType === "age") {
      const vaccineAgeMin = Number(vaccine.ageMin);
      const vaccineAgeMax = Number(vaccine.ageMax);
      const inputMin = searchValueMin ? Number(searchValueMin) : -Infinity;
      const inputMax = searchValueMax ? Number(searchValueMax) : Infinity;
      matchesSearch = vaccineAgeMin >= inputMin && vaccineAgeMax <= inputMax;
    }

    let matchesStatus = true;
    if (filterStatus === "active") {
      matchesStatus = vaccine.active === true;
    } else if (filterStatus === "inactive") {
      matchesStatus = vaccine.active === false;
    }

    return matchesSearch && matchesStatus;
  });

  const handleVaccineUpdated = (updatedVaccine) => {
    setVaccines((prev) =>
      prev.map((v) =>
        v.vaccineId === updatedVaccine.vaccineId ? updatedVaccine : v
      )
    );
  };

  // Toggle trạng thái active của vaccine
  const handleToggleActive = (id, currentStatus) => {
    axios
      .post(`http://localhost:8080/vaccine/active?id=${id}`, null, {
        withCredentials: true,
      })
      .then((res) => {
        console.log("API toggle active thành công:", res.data);
      })
      .then(() => {
        setVaccines((prev) =>
          prev.map((vaccine) =>
            vaccine.vaccineId === id
              ? { ...vaccine, active: !currentStatus }
              : vaccine
          )
        );
      })
      .catch((err) => console.error("Lỗi khi cập nhật trạng thái:", err));
  };

  // Xử lý tạo vaccine mới (chỉ với thông tin cơ bản)
  const handleCreateVaccine = (e) => {
    e.preventDefault();
    console.log("Creating vaccine:", newVaccine);
    axios
      .post("http://localhost:8080/vaccine/create", newVaccine, {
        withCredentials: true,
      })
      .then((res) => {
        console.log("Vaccine created successfully:", res.data);
        setShowCreateModal(false);
        setNewVaccine({
          name: "",
          doseNumber: 0,
          price: 0,
          description: "",
          country: "",
          ageMin: 0,
          ageMax: 0,
          active: true,
        });
        setNewVaccineError(null);
        fetchVaccines();
      })
      .catch((err) => {
        console.error("Lỗi khi tạo Vaccine:", err);
        setNewVaccineError(
          err.message || "Đã xảy ra lỗi khi tạo. Vui lòng thử lại!"
        );
      });
  };

  const VaccineItem = ({ vaccine, onVaccineUpdated, onToggleActive }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVaccine, setEditingVaccine] = useState(null);
    const [originalEditingVaccine, setOriginalEditingVaccine] = useState(null);

    const handleOpenModal = () => {
      setEditingVaccine({ ...vaccine });
      setOriginalEditingVaccine({ ...vaccine });
      setIsModalOpen(true);
    };

    const isChanged = () =>
      JSON.stringify(editingVaccine) !== JSON.stringify(originalEditingVaccine);

    const handleUpdate = () => {
      onVaccineUpdated(editingVaccine);
      setIsModalOpen(false);
    };

    const handleToggleActiveLocal = (e) => {
      e.stopPropagation();
      onToggleActive(vaccine.vaccineId, vaccine.active);
    };

    return (
      <>
        <div
          className="bg-white border-l-4 border-blue-500 rounded-lg shadow-md p-4 flex items-center justify-between hover:shadow-lg transition-all group"
          onClick={handleOpenModal}
        >
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <FaVial className="text-blue-600 w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                {vaccine.name}
              </h3>
              <p className="text-sm text-gray-500">
                Số liều: {vaccine.doseNumber} | Giá:{" "}
                {vaccine.price.toLocaleString()} VND
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleToggleActiveLocal}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all ${
                vaccine.active
                  ? "bg-red-100 text-red-600 hover:bg-red-200"
                  : "bg-green-100 text-green-600 hover:bg-green-200"
              }`}
            >
              <FaPowerOff />
              <span>{vaccine.active ? "Ngưng" : "Kích hoạt"}</span>
            </button>
            <NavLink
              to={`../vaccine-detail/${vaccine.vaccineId}`}
              className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200 transition-all flex items-center space-x-2"
            >
              Chi tiết
            </NavLink>
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-md z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl ring-1 ring-gray-200">
              <h2 className="text-2xl font-semibold mb-6">Cập Nhật Vaccine</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tên Vaccine:
                  </label>
                  <input
                    type="text"
                    value={editingVaccine.name}
                    onChange={(e) =>
                      setEditingVaccine({
                        ...editingVaccine,
                        name: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Số liều:
                  </label>
                  <input
                    type="number"
                    value={editingVaccine.doseNumber}
                    onChange={(e) =>
                      setEditingVaccine({
                        ...editingVaccine,
                        doseNumber: Number(e.target.value),
                      })
                    }
                    className="mt-1 w-full rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Giá (VND):
                  </label>
                  <input
                    type="number"
                    value={editingVaccine.price}
                    onChange={(e) =>
                      setEditingVaccine({
                        ...editingVaccine,
                        price: Number(e.target.value),
                      })
                    }
                    className="mt-1 w-full rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Mô tả:
                  </label>
                  <input
                    type="text"
                    value={editingVaccine.description}
                    onChange={(e) =>
                      setEditingVaccine({
                        ...editingVaccine,
                        description: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Xuất xứ:
                  </label>
                  <input
                    type="text"
                    value={editingVaccine.country}
                    onChange={(e) =>
                      setEditingVaccine({
                        ...editingVaccine,
                        country: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Độ tuổi tối thiểu:
                  </label>
                  <input
                    type="number"
                    value={editingVaccine.ageMin}
                    onChange={(e) =>
                      setEditingVaccine({
                        ...editingVaccine,
                        ageMin: Number(e.target.value),
                      })
                    }
                    className="mt-1 w-full rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Độ tuổi tối đa:
                  </label>
                  <input
                    type="number"
                    value={editingVaccine.ageMax}
                    onChange={(e) =>
                      setEditingVaccine({
                        ...editingVaccine,
                        ageMax: Number(e.target.value),
                      })
                    }
                    className="mt-1 w-full rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-500 hover:bg-gray-700 text-white px-3 py-2 rounded-md mr-2"
                >
                  Hủy
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={!isChanged()}
                  className={`font-bold py-2 px-4 rounded-lg ${
                    !isChanged()
                      ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-700 text-white"
                  }`}
                >
                  Cập nhật
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <div className="inline-flex items-center space-x-4">
            <FaSyringe className="text-5xl text-blue-600" />
            <h1 className="text-4xl font-light text-gray-800">
              Quản Lý Vắc Xin
            </h1>
          </div>
          <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
            Tra cứu, quản lý và theo dõi danh sách vắc xin trong hệ thống tiêm
            chủng
          </p>
        </header>

        <div className="bg-white shadow-xl rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4 w-full">
              <div className="relative flex-grow">
                <select
                  value={searchType}
                  onChange={(e) => {
                    setSearchType(e.target.value);
                    setSearchValue("");
                    setSearchValueMin("");
                    setSearchValueMax("");
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="name">Tìm theo tên</option>
                  <option value="price">Tìm theo giá</option>
                  <option value="age">Tìm theo độ tuổi</option>
                </select>
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              {searchType === "name" && (
                <input
                  type="text"
                  placeholder="Nhập tên vaccine"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="flex-grow pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}
              {(searchType === "price" || searchType === "age") && (
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Từ"
                    value={searchValueMin}
                    onChange={(e) => setSearchValueMin(e.target.value)}
                    className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Đến"
                    value={searchValueMax}
                    onChange={(e) => setSearchValueMax(e.target.value)}
                    className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex space-x-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setFilterStatus("all")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filterStatus === "all"
                      ? "bg-blue-500 text-white"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setFilterStatus("active")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filterStatus === "active"
                      ? "bg-blue-500 text-white"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Hoạt động
                </button>
                <button
                  onClick={() => setFilterStatus("inactive")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filterStatus === "inactive"
                      ? "bg-blue-500 text-white"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Không hoạt động
                </button>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaPlus />
                <span>Tạo mới Vaccine</span>
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredVaccines.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-md">
              <FaSyringe className="mx-auto text-5xl text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">
                Không tìm thấy vaccine nào phù hợp
              </p>
            </div>
          ) : (
            filteredVaccines.map((vaccine) => (
              <VaccineItem
                key={vaccine.vaccineId}
                vaccine={vaccine}
                onVaccineUpdated={handleVaccineUpdated}
                onToggleActive={handleToggleActive}
              />
            ))
          )}
        </div>

        {/* Modal Tạo mới Vaccine (chỉ với thông tin cơ bản) */}
        {showCreateModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div
              className="absolute inset-0 backdrop-blur-md"
              onClick={() => setShowCreateModal(false)}
            ></div>
            <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto transform transition-all animate-fadeIn">
              <h3 className="text-2xl font-bold text-blue-700 mb-4">
                Tạo Vaccine Mới
              </h3>
              <form onSubmit={handleCreateVaccine} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tên Vaccine <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newVaccine.name}
                    onChange={(e) =>
                      setNewVaccine({ ...newVaccine, name: e.target.value })
                    }
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                    placeholder="Nhập tên vaccine"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Số liều <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="doseNumber"
                      value={newVaccine.doseNumber}
                      onChange={(e) =>
                        setNewVaccine({
                          ...newVaccine,
                          doseNumber: Number(e.target.value),
                        })
                      }
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                      placeholder="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Giá (VND) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={newVaccine.price}
                      onChange={(e) =>
                        setNewVaccine({
                          ...newVaccine,
                          price: Number(e.target.value),
                        })
                      }
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                      placeholder="0"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Mô tả <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={newVaccine.description}
                    onChange={(e) =>
                      setNewVaccine({
                        ...newVaccine,
                        description: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                    placeholder="Nhập mô tả vaccine"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Xuất xứ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={newVaccine.country}
                    onChange={(e) =>
                      setNewVaccine({
                        ...newVaccine,
                        country: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                    placeholder="Nhập quốc gia xuất xứ"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Tuổi tối thiểu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="ageMin"
                      value={newVaccine.ageMin}
                      onChange={(e) =>
                        setNewVaccine({
                          ...newVaccine,
                          ageMin: Number(e.target.value),
                        })
                      }
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                      placeholder="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Tuổi tối đa <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="ageMax"
                      value={newVaccine.ageMax}
                      onChange={(e) =>
                        setNewVaccine({
                          ...newVaccine,
                          ageMax: Number(e.target.value),
                        })
                      }
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                      placeholder="0"
                      required
                    />
                  </div>
                </div>
                {newVaccineError && (
                  <p className="text-red-500 text-sm">{newVaccineError}</p>
                )}
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all"
                  >
                    Tạo
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-all"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Vaccines;
