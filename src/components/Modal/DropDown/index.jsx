import React, { useState, useEffect } from "react";
import axios from "axios";
import { Form, Select } from "antd";
import "./Dropdown.css"; // Import the CSS file

const Dropdown = ({ setAddress, editAddress, isCreateModal }) => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [communes, setCommunes] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedCommune, setSelectedCommune] = useState("");

  useEffect(() => {
    if (!isCreateModal) {
      const initialProvince = provinces.find(
        (option) => option.label === editAddress?.province
      );
      const initialDistrict = districts.find(
        (option) => option.label === editAddress?.district
      );
      const initialCommune = communes.find(
        (option) => option.label === editAddress?.commune
      );
      setSelectedProvince(initialProvince ? initialProvince.value : undefined);
      setSelectedDistrict(initialDistrict ? initialDistrict.value : undefined);
      setSelectedCommune(initialCommune ? initialCommune.value : undefined);
    }
  }, [provinces, districts, communes]);

  useEffect(() => {
    // Fetch provinces
    axios
      .get("https://esgoo.net/api-tinhthanh/1/0.htm")
      .then((response) => {
        const provinceOptions = response.data.data.map((province) => ({
          value: province.id,
          label: province.name,
        }));
        setProvinces(provinceOptions);
      })
      .catch((error) => {
        console.error("Error fetching provinces:", error);
      });
  }, []);

  useEffect(() => {
    if (selectedProvince) {
      // Fetch districts
      axios
        .get(`https://esgoo.net/api-tinhthanh/2/${selectedProvince}.htm`)
        .then((response) => {
          const districtOptions = response.data.data.map((district) => ({
            value: district.id,
            label: district.name,
          }));
          setDistricts(districtOptions);
        })
        .catch((error) => {
          console.error("Error fetching districts:", error);
        });
    } else {
      setDistricts([]);
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedDistrict) {
      // Fetch communes
      axios
        .get(`https://esgoo.net/api-tinhthanh/3/${selectedDistrict}.htm`)
        .then((response) => {
          const communeOptions = response.data.data.map((commune) => ({
            value: commune.id,
            label: commune.name,
          }));
          setCommunes(communeOptions);
        })
        .catch((error) => {
          console.error("Error fetching communes:", error);
        });
    } else {
      setCommunes([]);
    }
  }, [selectedDistrict]);

  const handleProvinceChange = (value, option) => {
    const selected = option.label;

    setAddress((prev) => ({
      ...prev,
      province: selected,
      district: "",
      commune: "",
    }));

    setSelectedProvince(value);
    setSelectedDistrict("");
    setSelectedCommune("");
  };

  const handleDistrictChange = (value, option) => {
    const selected = option.label;
    setAddress((prev) => ({
      ...prev,
      district: selected,
      commune: "",
    }));
    setSelectedDistrict(value);
    setSelectedCommune("");
  };

  const handleCommuneChange = (value, option) => {
    const selected = option.label;
    setAddress((prev) => ({
      ...prev,
      commune: selected,
    }));
    setSelectedCommune(value);
  };

  return (
    <div>
      <Form.Item name="province">
        <Select
          labelInValue={false}
          fieldNames="province"
          className="custom-select h-[38px] w-[40%]"
          options={provinces}
          onChange={handleProvinceChange}
          placeholder="Chọn tỉnh/thành phố"
        ></Select>
      </Form.Item>
      <Form.Item name="district">
        <Select
          fieldNames="district"
          className="custom-select h-[38px] w-[30%]"
          options={districts}
          onChange={handleDistrictChange}
          disabled={!selectedProvince}
          placeholder="Chọn quận/huyện"
        ></Select>
      </Form.Item>

      <Form.Item name="commune">
        <Select
          fieldNames="commune"
          className="custom-select  h-[38px] w-[30%]"
          options={communes}
          onChange={handleCommuneChange}
          disabled={!selectedDistrict}
          placeholder="Chọn xã phường"
        ></Select>
      </Form.Item>
    </div>
  );
};

export default Dropdown;
