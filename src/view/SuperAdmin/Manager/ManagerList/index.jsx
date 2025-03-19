import React, { useEffect, useMemo, useState } from "react";
import { debounce } from "lodash";
import {
    Button,
    Dropdown,
    Input,
    Table,
    Modal,
    Select,
    Radio,
    Upload,
    Spin,
    Form,
    Tabs,
} from "antd";
import {
    PlusCircleOutlined,
    MoreOutlined,
    EyeOutlined,
    DeleteOutlined,
    EditOutlined,
    DownloadOutlined,
    UploadOutlined,
} from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { useNavigate, useOutletContext } from "react-router-dom";
import './index.css'
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from 'xlsx';
import '..//..//..//..//utils/roboto'
import { font_data } from "..//..//..//..//utils/roboto";
import { changeUserPassword, changeUserStatus, createUser, deleteUser, getAllManagers, getAllUsers, searchUsers, updateUsers } from "../../../../services/userService";
import moment from "moment";
import { Bounce, toast, ToastContainer } from "react-toastify";
import { useLoading } from "../../../../provider/LoadingProvider";

const { Search } = Input;

const ManagerList = () => {
    const { startLoading, stopLoading } = useLoading();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [addCategoryItemData, setAddCategoryItemData] = useState({
        email: "",
        password: "",
        googleLoginFlag: false,
        role: ""
    });

    const [form] = Form.useForm();

    const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
    const [tabKey, setTabKey] = useState(1);
    const [updateValue, setUpdateValue] = useState("");
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [isDeleteUserModalVisible, setIsDeleteUserModalVisible] = useState(false);
    const [selectedUserEmail, setSelectedUserEmail] = useState(null);
    const [isChangeStatusModalVisible, setIsChangeStatusModalVisible] = useState(false);
    const [selectedStatusUserEmail, setSelectedStatusUserEmail] = useState(null);
    const [isImportModalVisible, setIsImportModalVisible] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [users, setUsers] = useState([]);
    const [managers, setManagers] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [updateOption, setUpdateOption] = useState("status");
    const [newPassword, setNewPassword] = useState("");
    const [isChangePasswordModal, setIsChangePasswordModal] = useState(false);
    const { vnMode } = useOutletContext();
    const [searchParams, setSearchParams] = useState({
        name: "",
        role: tabKey === 1 ? "" : (tabKey === 2 ? "ROLE_MANAGER" : "ROLE_USER"),
        status: "",
    });

    useEffect(() => {
        handleSearch();
    }, [searchParams.categoryItemIds,
    searchParams.status,
    searchParams.brandCategoryId,]);

    useEffect(() => {
        fetchData();
    }, [dispatch]);

    const fetchData = async () => {
        try {
            startLoading();
            setLoading(true);
            const usersRes = await dispatch(getAllUsers()).unwrap();
            const managersRes = await dispatch(getAllManagers()).unwrap();
            const usersWithRole = usersRes.map(user => ({
                ...user,
                role: "ROLE_USER"
            }));

            const managersWithRole = managersRes.map(user => ({
                ...user,
                role: "ROLE_MANAGER"
            }));
            const combinedCustomers = [...usersWithRole, ...managersWithRole];
            setUsers(usersWithRole);
            setManagers(managersWithRole);
            setCustomers(combinedCustomers);
            toast.success(vnMode ? "Tải dữ liệu thành công" : "Load data succesfully");
        } catch (error) {
            toast.error(vnMode ? "Lỗi tải dữ liệu" : "Failed to load data");
        } finally {
            stopLoading();
            setLoading(false);
        }
    };

    console.log(customers)

    const debouncedSearch = useMemo(
        () =>
            debounce((params) => {
                setLoading(true);
                dispatch(searchUsers({ ...params, page: 0, limit: 10 }))
                    .unwrap()
                    .then((res) => {
                        if (tabKey === 2) {
                            setUsers(res.map(user => ({ ...user, role: "ROLE_USER" })));
                        } else if (tabKey === 3) {
                            setManagers(res.map(user => ({ ...user, role: "ROLE_MANAGER" })));
                        } else {
                            setCustomers(res.map(user => ({
                                ...user,
                                role: user.isManager ? "ROLE_MANAGER" : "ROLE_USER" // Ensure role is correct
                            })));
                        }
                    })
                    .catch(() => {
                        toast.error(vnMode ? "Lỗi tìm kiếm" : "Search Error");
                    }).finally(() => {
                        setLoading(false);
                    })
            }, 300),
        [dispatch, tabKey]
    );

    const handleDeleteProduct = (email) => {
        setSelectedUserEmail(email);
        setIsDeleteUserModalVisible(true);
    };

    const handleDeleteSelectedProducts = async () => {
        if (selectedRowKeys.length === 0) {
            toast.warning(
                vnMode
                    ? "Vui lòng chọn ít nhất một người dùng để xóa!"
                    : "Please select at least one user to delete!"
            );
            return;
        }
        setIsDeleteModalVisible(true);
    };

    const handleConfirmDelete = async () => {
        setLoading(true);
        try {
            for (const email of selectedRowKeys) {
                await dispatch(deleteUser(email));
            }
            toast.success(
                vnMode
                    ? "Xóa tất cả người dùng thành công"
                    : "Successfully deleted all users"
            );
            setSelectedRowKeys([]);
        } catch (error) {
            toast.error(
                vnMode
                    ? "Xóa một số người dùng thất bại"
                    : "Failed to delete some users"
            );
        } finally {
            fetchData().finally(() => {
                setLoading(false);
                setIsDeleteModalVisible(false);
            });
        }
    };

    const handleCancelDelete = () => {
        setIsDeleteModalVisible(false);
    };

    const handleClear = async () => {
        setLoading(true);
        setSearchParams({
            name: "",
            status: "",
            brandCategoryId: "",
            categoryItemIds: [],
        });
        setLoading(false);
    };

    const handleInputChange = (key, value) => {
        setSearchParams((prev) => {
            if (prev[key] === value) return prev;
            return { ...prev, [key]: value };
        });
    };

    const handleSearch = () => {
        debouncedSearch(searchParams)
            ?.then((response) => {
                if (!response || response.length === 0) {
                    toast.warning(
                        vnMode
                            ? "Không tìm thấy"
                            : "No results found"
                    );
                } else {
                    toast.success(
                        vnMode
                            ? `Tìm thấy ${response.length} người dùng phù hợp.`
                            : `Found ${response.length} matching users.`
                    );
                }
            })
            .catch(() => {
                toast.error(
                    vnMode
                        ? "Đã xảy ra lỗi trong quá trình tìm kiếm. Vui lòng thử lại!"
                        : "An error occurred during the search process. Please try again!"
                );
            })
    };

    const handleConfirmDeleteUser = async () => {
        setLoading(true);
        try {
            await dispatch(deleteUser(selectedUserEmail)).unwrap();
            toast.success(
                vnMode
                    ? "Xóa người dùng thành công"
                    : "Successfully deleted user"
            );
            setCustomers(prevCustomers => prevCustomers.filter(c => c.email !== selectedUserEmail));
            setUsers(prevUsers => prevUsers.filter(c => c.email !== selectedUserEmail));
            setManagers(prevManagers => prevManagers.filter(c => c.email !== selectedUserEmail));

        } catch (error) {
            toast.error(
                vnMode
                    ? "Xóa người dùng thất bại"
                    : "Failed to delete user"
            );
        } finally {
            setLoading(false);
            setIsDeleteUserModalVisible(false);
            setSelectedUserEmail(null);
        }
    };

    const handleCancelDeleteUser = () => {
        setIsDeleteUserModalVisible(false);
        setSelectedUserEmail(null);
    };

    const handleChangeStatus = (email) => {
        setSelectedStatusUserEmail(email);
        setIsChangeStatusModalVisible(true);
    };

    const handleConfirmChangeStatus = async () => {
        setLoading(true);
        try {
            await dispatch(changeUserStatus(selectedStatusUserEmail));
            toast.success(
                vnMode
                    ? "Thay đổi trạng thái người dùng thành công"
                    : "Successfully changed user status"
            );
            await fetchData();
        } catch (error) {
            toast.error(
                vnMode
                    ? "Thay đổi trạng thái người dùng thất bại"
                    : "Failed to change user status"
            );
        } finally {
            setLoading(false);
            setIsChangeStatusModalVisible(false);
            setSelectedStatusUserEmail(null);
        }
    };

    const handleCancelChangeStatus = () => {
        setIsChangeStatusModalVisible(false);
        setSelectedStatusUserEmail(null);
    };

    const handleImport = async (file) => {
        setImportFile(file);
        setIsImportModalVisible(true);
    };

    const handleConfirmImport = async () => {
        setLoading(true);
        const fileExtension = importFile.name.split(".").pop().toLowerCase();

        try {
            if (fileExtension === "json") {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        const jsonData = JSON.parse(e.target.result);

                        for (const user of jsonData) {
                            const dateString = moment(user.birthday)
                                .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
                                .toISOString();

                            const updateValues = {
                                email: user.email,
                                password: user.password,
                                googleLoginFlag: user.active || false,
                                role: user.role || "ROLE_USER",
                                firstName: user.firstName || "",
                                lastName: user.lastName || "",
                                phoneNumber: user.phoneNumber || "",
                                birthday: dateString || "2000-01-01",
                                avatar: null,
                            };

                            await dispatch(createUser(updateValues));
                        }

                        toast.success(
                            vnMode
                                ? "Nhập dữ liệu từ file JSON thành công."
                                : "Successfully imported data from JSON file."
                        );
                        fetchData();
                    } catch (error) {
                        toast.error(
                            vnMode
                                ? "File JSON không hợp lệ hoặc xảy ra lỗi trong quá trình xử lý."
                                : "Invalid JSON file or an error occurred during processing."
                        );
                    } finally {
                        setLoading(false);
                        setIsImportModalVisible(false);
                        setImportFile(null);
                    }
                };
                reader.readAsText(importFile);
            } else if (fileExtension === "xls" || fileExtension === "xlsx") {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        const data = new Uint8Array(e.target.result);
                        const workbook = XLSX.read(data, { type: "array" });
                        const sheetName = workbook.SheetNames[0];
                        const sheet = workbook.Sheets[sheetName];
                        const jsonData = XLSX.utils.sheet_to_json(sheet);

                        for (const user of jsonData) {
                            const dateString = moment(user.birthday)
                                .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
                                .toISOString();

                            const updateValues = {
                                email: user.email,
                                password: user.password,
                                googleLoginFlag: user.active || false,
                                role: user.role || "ROLE_USER",
                                firstName: user.firstName || "",
                                lastName: user.lastName || "",
                                phoneNumber: user.phoneNumber || "",
                                birthday: dateString || "2000-01-01",
                                avatar: null,
                            };

                            await dispatch(createUser(updateValues));
                        }

                        toast.success(
                            vnMode
                                ? "Nhập dữ liệu từ file Excel thành công."
                                : "Successfully imported data from Excel file."
                        );
                        fetchData();
                    } catch (error) {
                        toast.error(
                            vnMode
                                ? "File Excel không hợp lệ hoặc xảy ra lỗi trong quá trình xử lý."
                                : "Invalid Excel file or an error occurred during processing."
                        );
                    } finally {
                        setLoading(false);
                        setIsImportModalVisible(false);
                        setImportFile(null);
                    }
                };
                reader.readAsArrayBuffer(importFile);
            } else {
                toast.error(
                    vnMode
                        ? "Chỉ hỗ trợ file JSON và Excel (.xls, .xlsx)."
                        : "Only JSON and Excel files (.xls, .xlsx) are supported."
                );
                setLoading(false);
                setIsImportModalVisible(false);
                setImportFile(null);
            }
        } catch (error) {
            toast.error(
                vnMode
                    ? "Đã xảy ra lỗi trong quá trình nhập dữ liệu."
                    : "An error occurred during the import process."
            );
            setLoading(false);
            setIsImportModalVisible(false);
            setImportFile(null);
        }
    };

    const handleCancelImport = () => {
        setIsImportModalVisible(false);
        setImportFile(null);
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();

        doc.addFileToVFS("Roboto-Regular.ttf", font_data);
        doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
        doc.setFont("Roboto");
        let dataDoc = customers;

        if (tabKey === "1") {
            dataDoc = customers
        } else if (tabKey === "2") {
            dataDoc = managers
        } else if (tabKey === "3") {
            dataDoc = users
        }

        const tableData = dataDoc?.map((user) => [
            user.userId,
            user.firstName + " " + user.lastName,
            user.email,
            user.phoneNumber,
            user.birthday,
            user.status
        ]);

        doc.autoTable({
            head: [["Mã", "Tên", "Email", "Số điện thoại", "Ngày sinh", "Trạng thái"]],
            body: tableData,
            styles: {
                font: "Roboto",
            },
        });

        doc.save("users.pdf");
    };

    const renderDropdownMenu = (record) => ({
        items: [
            {
                label: (
                    <div onClick={() => navigate(`/super-admin/user-detail/${record.role}/${record.email}`)}>
                        <EyeOutlined style={{ marginRight: 8 }} />
                        {vnMode ? "Xem chi tiết" : "Detail"}
                    </div>
                ),
                key: "view",
            },
            {
                label: (
                    <div onClick={() => handleChangeStatus(record.email)}>
                        <EditOutlined style={{ marginRight: 8 }} />
                        {vnMode ? "Thay đổi trạng thái" : "Change Status"}
                    </div>
                ),
                key: "update-status",
            },
            {
                label: (
                    <div onClick={() => handleDeleteProduct(record.email)}>
                        <DeleteOutlined style={{ marginRight: 8, color: "red" }} />
                        {vnMode ? "Xóa" : "Delete"}
                    </div>
                ),
                key: "delete",
            },
        ],
    });

    const handleUpdateSelectedProducts = () => {
        if (selectedRowKeys.length === 0) {
            toast.warning(
                vnMode
                    ? "Vui lòng chọn ít nhất một người dùng để cập nhật!"
                    : "Please select at least one user to update!"
            )
            return;
        }

        setIsUpdateModalVisible(true);
    };

    const handleChangePasswordModal = () => {
        if (selectedRowKeys.length === 0) {
            toast.warning(
                vnMode
                    ? "Vui lòng chọn ít nhất một người dùng để thay đổi mật khẩu!"
                    : "Please select at least one user to change the password!"
            );
            return;
        }

        setIsChangePasswordModal(true);
    };

    const handleConfirmUpdate = async () => {
        setLoading(true)
        if (selectedRowKeys.length === 0) {
            toast.warning(
                vnMode
                    ? "Vui lòng chọn ít nhất một người dùng để thay đổi mật khẩu!"
                    : "Please select at least one user to change the password!"
            );
            return;
        }

        try {
            let updates;
            if (updateOption === "status") {
                updates = {
                    userEmails: selectedRowKeys.join(","),
                    status: updateValue,
                    role: ""
                };
            } else {
                updates = {
                    userEmails: selectedRowKeys.join(","),
                    role: updateValue,
                    status: ""
                };
            }


            await dispatch(updateUsers(updates))
                .unwrap()
                .then(() => {
                    toast.success(
                        vnMode
                            ? "Cập nhật thông tin người dùng thành công."
                            : "Successfully updated user information."
                    );
                });
            setIsUpdateModalVisible(false);
            fetchData()
        } catch (error) {
            toast.error(
                vnMode
                    ? "Đã xảy ra lỗi trong quá trình cập nhật thông tin người dùng."
                    : "An error occurred while updating user information."
            );
        }
    };

    const handleChangePassword = async () => {
        setLoading(true);
        try {
            for (const email of selectedRowKeys) {
                const params = {
                    password: newPassword,
                    email: email
                }
                await dispatch(changeUserPassword(params));
            }
            toast.success(
                vnMode
                    ? "Đã thay đổi mật khẩu người dùng thành công!"
                    : "Successfully updated the user password!"
            );
        } catch (err) {
            toast.error(
                vnMode
                    ? "Thay đổi mật khẩu người dùng thất bại. Vui lòng thử lại!"
                    : "Failed to update the user password. Please try again!"
            );
        } finally {
            setIsChangePasswordModal(false)
            setNewPassword("")
            setLoading(false);
        }
    }

    const columns = [
        {
            title: vnMode ? "Mã người dùng" : "User ID",
            dataIndex: "userId",
            sorter: (a, b) =>
                a?.userId?.localeCompare(b?.userId, undefined, {
                    numeric: true,
                    sensitivity: "base",
                }),
        },
        {
            title: vnMode ? "Họ và tên" : "Full name",
            dataIndex: "name",
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: vnMode ? "Email" : "Email",
            dataIndex: "email",
            sorter: (a, b) => a.email.localeCompare(b.email),
        },
        {
            title: vnMode ? "Số điện thoại" : "Phone number",
            dataIndex: "phoneNumber",
            sorter: (a, b) => a.phoneNumber.localeCompare(b.phoneNumber),
        },
        {
            title: vnMode ? "Ngày sinh" : "Birthday",
            dataIndex: "birthday",
            sorter: (a, b) => a.birthday.localeCompare(b.birthday),
            render: (text) => { // Thêm phần render
                return moment(text).format("DD/MM/YYYY"); // Định dạng lại ngày tháng
            },
        },
        {
            title: vnMode ? "Trạng thái" : "Status",
            dataIndex: "status",
            sorter: (a, b) => a.status.localeCompare(b.birthday),
        },
        {
            title: vnMode ? "Thao tác" : "Action",
            key: "operation",
            fixed: "right",
            render: (record) => (
                <Dropdown
                    menu={renderDropdownMenu(record)}
                    trigger={["click"]}
                    overlayClassName="dropdown-custom"
                >
                    <MoreOutlined style={{ cursor: "pointer", fontSize: 16 }} />
                </Dropdown>
            ),
        }
    ];

    const data = managers?.map((manager, index) => ({
        key: index,
        userId: manager.userId,
        name: manager.firstName + " " + manager.lastName,
        email: manager.email,
        phoneNumber: manager.phoneNumber,
        birthday: manager.birthday,
        status: manager.status === "Lock" ? vnMode ? "Khoá" : "Lock" : vnMode ? "Mở" : "Unlock",
        role: manager.role
    }));

    const data2 = users?.map((manager, index) => ({
        key: index,
        userId: manager.userId,
        name: manager.firstName + " " + manager.lastName,
        email: manager.email,
        phoneNumber: manager.phoneNumber,
        birthday: manager.birthday,
        status: manager.status === "Lock" ? vnMode ? "Khoá" : "Lock" : vnMode ? "Mở" : "Unlock",
        role: manager.role
    }));

    const data3 = customers?.map((manager, index) => ({
        key: index,
        userId: manager.userId,
        name: manager.firstName + " " + manager.lastName,
        email: manager.email,
        phoneNumber: manager.phoneNumber,
        birthday: manager.birthday,
        status: manager.status === "Lock" ? vnMode ? "Khoá" : "Lock" : vnMode ? "Mở" : "Unlock",
        role: manager.role
    }));

    const onChange = (key) => {
        setTabKey(key);
    };
    const items = [
        {
            key: '1',
            label: vnMode ? 'Tất cả' : 'All',
            children: (
                <Table
                    rowKey="email"
                    columns={columns}
                    dataSource={data3}
                    rowSelection={{
                        selectedRowKeys,
                        onChange: (keys) => setSelectedRowKeys(keys),
                    }}
                    pagination={{ pageSize: 10 }}
                />
            )
        },
        {
            key: '2',
            label: vnMode ? 'Quản lý' : 'Manager',
            children: (
                <Table
                    rowKey="userId"
                    columns={columns}
                    dataSource={data}
                    rowSelection={{
                        selectedRowKeys,
                        onChange: (keys) => setSelectedRowKeys(keys),
                    }}
                    pagination={{ pageSize: 10 }}
                />
            )
        },
        {
            key: '3',
            label: vnMode ? 'Khách hàng' : 'Customer',
            children: (
                <Table
                    rowKey="userId"
                    columns={columns}
                    dataSource={data2}
                    rowSelection={{
                        selectedRowKeys,
                        onChange: (keys) => setSelectedRowKeys(keys),
                    }}
                    pagination={{ pageSize: 10 }}
                />
            )
        },
    ];

    const handleAddCategoryItem = async () => {
        if (!addCategoryItemData.email || !addCategoryItemData.password) {
            toast.error(
                vnMode
                    ? "Vui lòng điền đầy đủ thông tin người dùng."
                    : "Please fill in all user information."
            );
            return;
        }


        const updateValues = {
            email: addCategoryItemData.email,
            password: addCategoryItemData.password,
            googleLoginFlag: addCategoryItemData.googleLoginFlag,
            role: addCategoryItemData.role,
            firstName: "",
            lastName: "",
            phoneNumber: "",
            birthday: "2000-01-01",
            avatar: null,
        };

        setLoading(true);
        await dispatch(createUser(updateValues))
            .unwrap()
            .then(() => {
                fetchData().then(() => setLoading(false))
                toast.success(
                    vnMode
                        ? "Thêm người dùng thành công."
                        : "Successfully added user."
                );
                setAddCategoryItemData({ email: "", password: "", role: "", googleLoginFlag: false });
                setIsAddModalVisible(false);
                form.resetFields();
            })
            .catch(() => {
                toast.error(
                    vnMode
                        ? "Thêm người dùng thất bại."
                        : "Failed to add user."
                );
                setLoading(false);
            })
    };

    return (
        <div>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                transition={Bounce}
            />
            <div className="search-actions-container flex flex-wrap items-center justify-between gap-4 mb-5 ">
                <div className="search-filters flex flex-wrap items-center gap-3 w-full">
                    <Search
                        placeholder={vnMode ? "Tìm kiếm theo tên và id" : "Search by name, email and id"}
                        value={searchParams.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        onSearch={(value) => {
                            handleInputChange("name", value);
                            handleSearch();
                        }}
                        className="w-1/3"
                    />

                    <Select
                        placeholder={vnMode ? "Trạng thái" : "Status"}
                        value={searchParams.status || undefined}
                        defaultValue={undefined}
                        onChange={(value) => handleInputChange("status", value)}
                        className="w-48"
                        allowClear
                    >
                        {vnMode ? <>
                            <Select.Option value="Lock">Khoá</Select.Option>
                            <Select.Option value="Unlock">Mở</Select.Option>
                        </> : <>
                            <Select.Option value="Lock">Lock</Select.Option>
                            <Select.Option value="Unlock">Unlock</Select.Option>
                        </>
                        }
                    </Select>
                    <Button type="primary" danger onClick={handleClear}>
                        {vnMode ? "Xoá" : "Clear"}
                    </Button>
                </div>

                {/* Nút hành động */}
                <div className="action-buttons flex gap-3">
                    <Button
                        type="primary"
                        icon={<DeleteOutlined />}
                        danger
                        onClick={handleDeleteSelectedProducts}
                        disabled={selectedRowKeys.length === 0} // Chỉ bật khi có sản phẩm được chọn
                    >
                        {vnMode ? "Xoá các mục đã chọn" : "Delete all selected records"}
                    </Button>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={handleUpdateSelectedProducts}
                        disabled={selectedRowKeys.length === 0}
                    >
                        {vnMode ? "Cập nhật các mục đã chọn" : "Update all selected records"}
                    </Button>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={handleChangePasswordModal}
                        disabled={selectedRowKeys.length === 0}
                    >
                        {vnMode ? "Đặt lại mật khẩu" : "Reset Password"}
                    </Button>
                    <Button
                        type="primary"
                        icon={<PlusCircleOutlined />}
                        onClick={() => setIsAddModalVisible(true)}
                    >
                        {vnMode ? "Thêm người dùng" : "Add user"}
                    </Button>
                    <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        onClick={handleExportPDF}
                    >
                        {vnMode ? "Xuất PDF" : "Export PDF"}
                    </Button>
                    <Upload
                        accept=".xlsx, .xls, .json"
                        showUploadList={false}
                        beforeUpload={(file) => {
                            handleImport(file);
                            return false;
                        }}
                    >
                        <Button type="primary" icon={<UploadOutlined />}>{vnMode ? "Nhập dữ liệu" : "Import data"}</Button>
                    </Upload>
                </div>
            </div>

            <Modal
                title="Cập nhật sản phẩm"
                open={isUpdateModalVisible}
                onOk={async () => {
                    setLoading(true);
                    await handleConfirmUpdate();
                    setLoading(false);
                }}
                onCancel={() => setIsUpdateModalVisible(false)}
                okText="Xác nhận"
                cancelText="Hủy"
                confirmLoading={loading}>
                <div className="flex flex-col gap-4">
                    <Radio.Group
                        value={updateOption}
                        onChange={(e) => setUpdateOption(e.target.value)}
                    >
                        <Radio value="status">{vnMode ? "Trạng thái" : "Status"}</Radio>
                        <Radio value="role">{vnMode ? "Quyền" : "Role"}</Radio>
                    </Radio.Group>

                    {updateOption === "status" && (
                        <Select
                            options={vnMode ? [
                                { value: "Lock", label: "Khoá" },
                                { value: "Unlock", label: "Mở khoá" },
                            ] :
                                [
                                    { value: "Lock", label: "Lock" },
                                    { value: "Unlock", label: "Unlock" },
                                ]}
                            onChange={(value) => setUpdateValue(value)}
                            placeholder={vnMode ? "Trạng thái" : "Status"}
                            className="w-full"
                        />
                    )}
                    {updateOption === "role" && (
                        <Select
                            options={vnMode ? [
                                { value: "ROLE_USER", label: "Người dùng" },
                                { value: "ROLE_MANAGER", label: "Quản lý" },
                            ] :
                                [
                                    { value: "ROLE_USER", label: "User" },
                                    { value: "ROLE_MANAGER", label: "Manager" },
                                ]}
                            onChange={(value) => setUpdateValue(value)}
                            placeholder={vnMode ? "Quyền" : "Role"}
                            className="w-full"
                        />
                    )}
                </div>
            </Modal>
            <Modal
                title={vnMode ? "Thêm người dùng" : "Create User"}
                open={isAddModalVisible}
                onOk={handleAddCategoryItem}
                onCancel={() => setIsAddModalVisible(false)}
                okText={vnMode ? "Tạo" : "Create"}
                cancelText={vnMode ? "Huỷ" : "Cancel"}
                confirmLoading={loading}
            >
                <Form layout="vertical" form={form}>
                    <Form.Item
                        label={vnMode ? "Email" : "Email"}
                        name="email"
                        rules={[
                            {
                                required: true,
                                message: vnMode
                                    ? "Nhập email!"
                                    : "Enter email!",
                            },
                        ]}
                    >
                        <Input
                            value={addCategoryItemData.email}
                            onChange={(e) =>
                                setAddCategoryItemData((prev) => ({
                                    ...prev,
                                    email: e.target.value,
                                }))
                            }
                        />
                    </Form.Item>
                    <Form.Item
                        label={vnMode ? "Mật khẩu" : "Password"}
                        name="password"
                        rules={[
                            {
                                required: true,
                                message: vnMode
                                    ? "Nhập password!"
                                    : "Enter password!",
                            },
                        ]}
                    >
                        <Input
                            value={addCategoryItemData.password}
                            onChange={(e) =>
                                setAddCategoryItemData((prev) => ({
                                    ...prev,
                                    password: e.target.value,
                                }))
                            }
                        />
                    </Form.Item>
                    <div className="flex flex-col gap-2 ">
                        <label className="font-semibold" htmlFor="">
                            {vnMode ? "Trạng thái" : "State"}
                        </label>
                        <Form.Item
                            name="googleLoginFlag"
                        >
                            <Select
                                value={addCategoryItemData.googleLoginFlag}
                                onChange={(e) =>
                                    setAddCategoryItemData((prev) => ({
                                        ...prev,
                                        googleLoginFlag: e,
                                    }))
                                }
                                options={[
                                    { value: true, label: vnMode ? "Mở" : "Unlock" },
                                    { value: false, label: vnMode ? "Khoá" : "Lock" },
                                ]}
                            />
                        </Form.Item>
                    </div>
                    <div className="flex flex-col gap-2 ">
                        <label className="font-semibold" htmlFor="">
                            {vnMode ? "Quyền" : "Role"}
                        </label>
                        <Form.Item
                            name="role"
                        >
                            <Select
                                value={addCategoryItemData.role}
                                onChange={(e) =>
                                    setAddCategoryItemData((prev) => ({
                                        ...prev,
                                        role: e,
                                    }))
                                }
                                options={[
                                    { value: "ROLE_MANAGER", label: vnMode ? "Quản lý" : "Manager" },
                                    { value: "ROLE_USER", label: vnMode ? "Người dùng" : "User" },
                                ]}
                            />
                        </Form.Item>
                    </div>
                </Form>
            </Modal>
            <Modal
                title={vnMode ? "Dổi mật khẩu" : "Change Password"}
                open={isChangePasswordModal}
                onOk={handleChangePassword}
                onCancel={() => setIsChangePasswordModal(false)}
                okText={vnMode ? "Tạo" : "Create"}
                cancelText={vnMode ? "Huỷ" : "Cancel"}
                confirmLoading={loading}
            >
                <div>Password:</div>
                <Input
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />
            </Modal>
            <Modal
                open={isDeleteModalVisible}
                title={
                    vnMode
                        ? "Bạn có chắc chắn muốn xóa các người dùng đã chọn không?"
                        : "Are you sure you want to delete the selected users?"
                }
                onOk={handleConfirmDelete}
                onCancel={handleCancelDelete}
                confirmLoading={loading}
            >
                <p>
                    {vnMode
                        ? "Hành động này không thể hoàn tác. Vui lòng xác nhận!"
                        : "This action cannot be undone. Please confirm!"}
                </p>
            </Modal>
            <Modal
                open={isDeleteUserModalVisible}
                title={
                    vnMode
                        ? "Bạn có chắc chắn muốn xóa người dùng này không?"
                        : "Are you sure you want to delete this user?"
                }
                onOk={handleConfirmDeleteUser}
                onCancel={handleCancelDeleteUser}
                confirmLoading={loading}
            >
                <p>
                    {vnMode
                        ? "Hành động này không thể hoàn tác. Vui lòng xác nhận!"
                        : "This action cannot be undone. Please confirm!"}
                </p>
            </Modal>
            <Modal
                open={isChangeStatusModalVisible}
                title={
                    vnMode
                        ? "Bạn có chắc chắn muốn thay đổi trạng thái người dùng này không?"
                        : "Are you sure you want to change the status of this user?"
                }
                onOk={handleConfirmChangeStatus}
                onCancel={handleCancelChangeStatus}
                confirmLoading={loading}
            >
                <p>
                    {vnMode
                        ? "Hành động này sẽ thay đổi trạng thái người dùng. Vui lòng xác nhận!"
                        : "This action will change the user's status. Please confirm!"}
                </p>
            </Modal>
            <Modal
                open={isImportModalVisible}
                title={
                    vnMode
                        ? "Bạn có chắc chắn muốn nhập các tệp đã chọn không?"
                        : "Are you sure you want to import the selected files?"
                }
                onOk={handleConfirmImport}
                onCancel={handleCancelImport}
                confirmLoading={loading}
            >
                <p>
                    {vnMode
                        ? "Hành động này không thể hoàn tác. Vui lòng xác nhận!"
                        : "This action cannot be undone. Please confirm!"}
                </p>
            </Modal>

            <Spin spinning={loading}>
                <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
            </Spin>
        </div>
    );
};

export default ManagerList;