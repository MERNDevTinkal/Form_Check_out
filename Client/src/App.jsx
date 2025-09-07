import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const App = () => {
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem("formData");
    return saved
      ? JSON.parse(saved)
      : { name: "", department: "", mobile: "", checked: false };
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!formData.submitted) {
      localStorage.setItem(
        "formData",
        JSON.stringify({ ...formData, submitted: false })
      );
    }
  }, [formData]);

  const validateField = (name, value, checked) => {
    switch (name) {
      case "name":
        return !value.trim() ? "Name cannot be empty" : "";
      case "department":
        return !value.trim() ? "Department cannot be empty" : "";
      case "mobile":
        if (!value.trim()) return "Mobile cannot be empty";
        if (!/^[0-9]{10}$/.test(value)) return "Enter a valid 10-digit number";
        return "";
      case "checked":
        return !checked ? "Check me out to continue" : "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      submitted: false,
    }));

    setErrors((prev) => {
      const newErrors = { ...prev };
      const errorMsg = validateField(name, value, checked);
      if (errorMsg) newErrors[name] = errorMsg;
      else delete newErrors[name];
      return newErrors;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key], formData.checked);
      if (error) finalErrors[key] = error;
    });

    if (Object.keys(finalErrors).length > 0) {
      setErrors(finalErrors);
      return;
    }

    setLoading(true);

    try {
     const res = await axios.post(
    `${import.meta.env.VITE_SERVER_API_URL}/users`,
    formData
  );


      if (res.data.success) {
        toast.success("Form submitted successfully!");
        setFormData({
          name: "",
          department: "",
          mobile: "",
          checked: false,
          submitted: true,
        });
        localStorage.removeItem("formData");
        setErrors({});
      } else {
        toast.error(res.data.error || "Unknown error");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        `Server not responding: ${error.response?.data?.error || error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-500 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-xs">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                errors.name ? "border-red-500" : ""
              }`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">Department</label>
            <input
              type="text"
              name="department"
              placeholder="Enter your Department"
              value={formData.department}
              onChange={handleChange}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                errors.department ? "border-red-500" : ""
              }`}
            />
            {errors.department && (
              <p className="text-red-500 text-sm mt-1">{errors.department}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">Mobile no.</label>
            <input
              type="text"
              name="mobile"
              placeholder="Enter your mobile no."
              value={formData.mobile}
              onChange={handleChange}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                errors.mobile ? "border-red-500" : ""
              }`}
            />
            {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="checked"
              checked={formData.checked}
              onChange={handleChange}
              className="mr-2"
            />
            <label className="text-gray-700 font-medium">Check me out</label>
          </div>
          {errors.checked && <p className="text-red-500 text-sm mt-1">{errors.checked}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 text-white py-2 rounded transition ${
              loading ? "cursor-not-allowed opacity-50" : "hover:bg-blue-700 cursor-pointer"
            }`}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default App;
