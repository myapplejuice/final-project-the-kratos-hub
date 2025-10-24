import React, { Fragment, useContext, useEffect, useState } from "react";
import * as styles from "../index.css";
import APIService from "../utils/api-service";
import { useNavigate } from "react-router-dom";
import SessionStorageService from "../utils/session-storage-service";
import { usePopups } from "../utils/popups.provider";
import { images } from "../utils/assets";
import { routes } from "../utils/constants";
import colors from "../utils/stylings";
import { formatPermissions } from "../utils/utilities";

export default function Dashboard() {
    const admin = SessionStorageService.getItem("admin").admin;
    const { showMessager, hideMessager, showDialog, showSpinner, hideSpinner, showInput, hideInput, showAlert } = usePopups();
    const nav = useNavigate();

    const [expandedAdmin, setExpandedAdmin] = useState(null);
    const [activeSection, setActiveSection] = useState("Users");
    const [searchQuery, setSearchQuery] = useState("");
    const [admins, setAdmins] = useState([]);

    const [users, setUsers] = useState([]);
    const [verificationApps, setVerificationApps] = useState([]);
    const [reports, setReports] = useState([]);

    const [visibleUsers, setVisibleUsers] = useState([]);
    const [visibleApps, setVisibleApps] = useState([]);

    const [filterTerminated, setFilterTerminated] = useState('all');
    const [filterAppStatus, setFilterAppStatus] = useState('all');

    useEffect(() => {
        if (!admin) return;

        async function fetchDashboardData() {
            try {
                showSpinner();
                const result = await APIService.routes.dashboardData({ isSeed: admin.isSeed });

                if (result.success) {
                    const users = result.data.users;
                    const admins = result.data.admins;
                    const applications = result.data.applications;
                    const reports = result.data.reports;

                    console.log(reports);
                    setUsers(users);
                    setAdmins(admins);
                    setVerificationApps(applications);
                    setReports(reports);
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                hideSpinner();
            }
        }

        fetchDashboardData();
    }, []);

    useEffect(() => {
        if (activeSection === "Users") {
            const filtered = users.filter(user => {
                const matchesSearch =
                    user.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    user.lastname.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    user.id.toLowerCase().includes(searchQuery.toLowerCase());

                let matchesStatus
                if (filterTerminated === 'all') {
                    matchesStatus = true
                } else {
                    matchesStatus = user.isTerminated && filterTerminated === 'terminated' || !user.isTerminated && filterTerminated === 'active'
                }

                return matchesSearch && matchesStatus;
            });

            setVisibleUsers(filtered);
        } else if (activeSection === "Verification") {
            const filtered = verificationApps.filter(app => {
                const user = users.find(user => user.id === app.userId);
                const idString = String(app.id);
                const matchesSearch =
                    user.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    user.lastname.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    idString.toLowerCase().includes(searchQuery.toLowerCase());

                let matchesStatus = true;
                if (filterAppStatus === "all") {
                    matchesStatus = true;
                } else if (filterAppStatus === "pending") {
                    matchesStatus = app.status === "pending";
                } else if (filterAppStatus === "approved") {
                    matchesStatus = app.status === "approved";
                } else if (filterAppStatus === "rejected") {
                    matchesStatus = app.status === "rejected";
                } else if (filterAppStatus === "cancelled") {
                    matchesStatus = app.status === "cancelled";
                }

                return matchesSearch && matchesStatus;
            });

            setVisibleApps(filtered);
        }
    }, [users, filterAppStatus, verificationApps, activeSection, searchQuery, filterTerminated]);


    function handleAddAdmin() {
        showInput({
            title: "Add New Admin",
            message: "Enter the admin details below:",
            inputs: [
                {
                    name: "accessId",
                    label: "Access ID",
                    type: "text",
                    placeholder: "Enter access ID",
                    required: true
                },
                {
                    name: "accessPassword",
                    label: "Password",
                    type: "password",
                    placeholder: "Enter password",
                    required: true
                },
                {
                    name: "permissions",
                    label: "Permissions",
                    type: "select",
                    options: [
                        { value: "all", label: "All Permissions" },
                        { value: "read", label: "Read Only" },
                        { value: "verifications", label: "Resolving Verifications" },
                        { value: "termination", label: "Terminating Users" },
                    ],
                    required: true
                }
            ],
            onConfirm: async (values) => {
                hideInput();
                const { accessId, accessPassword, permissions } = values;
                if (!accessId || !accessPassword || !permissions) return showAlert({ title: "Failure", message: "All fields are required to create an admin account" });

                const payload = {
                    accessId,
                    accessPassword,
                    permissions
                }

                try {
                    showSpinner();

                    const result = await APIService.routes.newAdmin(payload);

                    if (result.success) {
                        const admin = result.data.admin;
                        setAdmins([...admins, admin]);
                    }
                } catch (error) {
                    console.error("Error fetching dashboard data:", error);
                } finally {
                    hideSpinner();
                }
            },
            confirmText: "Create Admin"
        });
    };

    function handleEditAdmin(admin) {
        showInput({
            title: "Edit Admin",
            message: "Enter new admin details below (skip fields to keep untouched):",
            inputs: [
                {
                    name: "accessId",
                    label: "Access ID",
                    type: "text",
                    placeholder: "Enter new access ID",
                    required: false
                },
                {
                    name: "accessPassword",
                    label: "Password",
                    type: "password",
                    placeholder: "Enter new password",
                    required: false
                },
                {
                    name: "permissions",
                    label: "Permissions",
                    type: "checkbox-group",
                    options: [
                        {
                            value: "all",
                            label: "All Permissions",
                            onClickRemoveOthers: true
                        },
                        {
                            value: "read",
                            label: "Read Only",
                            onClickRemoveOthers: true
                        },
                        {
                            value: "verifications",
                            label: "Resolving Verifications"
                        },
                        {
                            value: "termination",
                            label: "Terminating Users"
                        },
                        {
                            value: "notify",
                            label: "Notifying Users"
                        },
                        {
                            value: "warn",
                            label: "Issueing Warnings"
                        },
                    ],
                    required: false
                }
            ],
            onConfirm: async (values) => {
                hideInput();
                let { accessId, accessPassword, permissions } = values;
                console.log(values)

                if (!accessId) accessId = admin.accessId;
                if (!permissions) permissions = admin.permissions;

                const payload = {
                    id: admin.id,
                    accessId,
                    accessPassword: accessPassword ? accessPassword : null,
                    permissions
                }

                try {
                    showSpinner();
                    const result = await APIService.routes.updateAdmin(payload);

                    if (result.success) {
                        const admin = result.data.admin;
                        setAdmins(prev => prev.map(prevAdmin => prevAdmin.id === admin.id ? admin : prevAdmin));
                    }
                } catch (error) {
                    console.error("Error updating admin:", error);
                } finally {
                    hideSpinner();
                }
            },
            confirmText: "Confirm"
        });
    }

    function handleTerminateAdmin(admin) {
        showDialog({
            title: `Admin ${admin.isActive ? "Activation" : "Termination"}`,
            content: <p>Are you sure you want to {admin.isActive ? "activate" : "terminate"} this admin?</p>,
            actions: [
                {
                    label: "Cancel", color: "#5a5a5aff", onClick: null
                },
                {
                    label: "Yes", color: !admin.isActive ? "#cc2e2eff" : "#187ad4ff", onClick: async () => {

                        const result = await APIService.routes.terminateAdmin({ id: admin.id, isActive: !admin.isActive });

                        console.log(result);
                        if (result.success) {
                            setAdmins(prev => prev.map(prevAdmin => prevAdmin.id === admin.id ? { ...prevAdmin, isActive: !prevAdmin.isActive } : prevAdmin));
                        }
                    }
                }
            ]
        })
    }

    return (
        <div className="admin-page">
            <aside className="admin-sidebar">
                <div>
                    <h2>Kratos Hub Administration</h2>
                    <ul>
                        {[
                            "Users",
                            "Verification",
                            "Reports",
                            //"Community Posts",
                            //"Food List",
                        ].map((section) => (
                            <li key={section} className={activeSection === section ? "active" : ""} onClick={() => { setSearchQuery(''), setActiveSection(section) }}>
                                {section}{" "}{section === "Verification" ? `${verificationApps.filter(app => app.status === "pending").length === 0 ? '' : `(${verificationApps.filter(app => app.status === "pending").length})`}` : ""}
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    {admin.isSeed &&
                        <div className={activeSection === 'Admins' ? "admins-tab-active" : "admins-tab"}>
                            <button className="admin-tab-btn" onClick={() => setActiveSection('Admins')} style={{ marginBottom: 15 }}>
                                Admins
                                <img src={images.arrow} className="admin-tab-arrow" />
                            </button>
                        </div>
                    }
                    <div>
                        <button className="admin-logout-btn" onClick={() => {
                            SessionStorageService.removeItem("admin");
                            nav("/");
                        }}>Sign Out</button>
                    </div>
                </div>
            </aside>

            <main className="admin-main">
                {activeSection === "Users" && (
                    <div className="admin-section" style={{ marginBottom: 300 }}>
                        <h2>Users</h2>
                        <p style={{ margin: '0 0 0px 0', color: '#6b7280' }}>
                            Total: {users.length} / Filter: {visibleUsers.length}
                        </p>
                        <p style={{ margin: '0 0 20px 0', color: '#6b7280' }}>
                            Active: {users.filter(user => !user.isTerminated).length} / Terminations: {users.filter(user => user.isTerminated).length}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: 25 }}>
                            <input
                                type="text"
                                placeholder="ID, Firstname, Lastname..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input"
                                style={{ flex: 1 }}
                            />

                            <button
                                onClick={() => setFilterTerminated('all')}
                                className="status-btn active-btn"
                                style={{ background: filterTerminated === 'all' ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : 'rgba(233, 233, 233, 0.1)' }}
                            >
                                All
                            </button>

                            <button
                                onClick={() => setFilterTerminated('active')}
                                className="status-btn active-btn"
                                style={{ background: filterTerminated === 'active' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'rgba(233, 233, 233, 0.1)' }}
                            >
                                Active
                            </button>

                            <button
                                onClick={() => setFilterTerminated('terminated')}
                                className="status-btn terminated-btn"
                                style={{ background: filterTerminated === 'terminated' ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'rgba(233, 233, 233, 0.1)' }}
                            >
                                Terminated
                            </button>
                        </div>

                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Account Status</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {visibleUsers.map((user, i) => (
                                    <tr key={user.id} onClick={() => nav(routes.user_profile, { state: { user } })}>
                                        <td>{i + 1}</td>
                                        <td>{user.id}</td>
                                        <td>{user.firstname} {user.lastname}</td>
                                        <td>{user.email}</td>
                                        <td style={{ color: user.isTerminated ? '#ff0000ff' : "#00ff00" }}>{user.isTerminated ? 'Terminated' : 'Active'}</td>
                                        <td><img src={images.arrow} style={{ width: '20px', height: '20px', filter: 'brightness(0) invert(1)' }} /> </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeSection === "Verification" && (
                    <div className="admin-section">
                        <h2>{activeSection}</h2>
                        <div>
                        <p style={{ margin: '0 0 0px 0', color: '#6b7280' }}>
                            Total: {verificationApps.length} / Filter: {visibleApps.length}
                        </p>
                            <p style={{ margin: '0 0 20px 0', color: '#6b7280' }}>
                           Approved: {verificationApps.filter(app => app.status === 'approved').length} / Pending: {verificationApps.filter(app => app.status === 'pending').length} / Rejected: {verificationApps.filter(app => app.status === 'rejected').length} / Cancelled: {verificationApps.filter(app => app.status === 'cancelled').length}
                        </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: 25 }}>
                            <input
                                type="text"
                                placeholder="ID, User ID, Firstname, Lastname..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input"
                                style={{ flex: 1 }}
                            />

                            <button
                                onClick={() => setFilterAppStatus('all')}
                                className="status-btn active-btn"
                                style={{
                                    background: filterAppStatus === 'all' ?
                                        'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' :
                                        'rgba(233, 233, 233, 0.1)'
                                }}
                            >
                                All
                            </button>

                            <button
                                onClick={() => setFilterAppStatus("pending")}
                                className="status-btn active-btn"
                                style={{
                                    background: filterAppStatus === "pending" ?
                                        'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' :
                                        'rgba(233, 233, 233, 0.1)'
                                }}
                            >
                                Pending
                            </button>

                            <button
                                onClick={() => setFilterAppStatus("approved")}
                                className="status-btn active-btn"
                                style={{
                                    background: filterAppStatus === "approved" ?
                                        'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
                                        'rgba(233, 233, 233, 0.1)'
                                }}
                            >
                                Approved
                            </button>

                            <button
                                onClick={() => setFilterAppStatus("rejected")}
                                className="status-btn terminated-btn"
                                style={{
                                    background: filterAppStatus === "rejected" ?
                                        'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' :
                                        'rgba(233, 233, 233, 0.1)'
                                }}
                            >
                                Rejected
                            </button>

                            <button
                                onClick={() => setFilterAppStatus("cancelled")}
                                className="status-btn terminated-btn"
                                style={{
                                    background: filterAppStatus === "cancelled" ?
                                        'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)' :
                                        'rgba(233, 233, 233, 0.1)'
                                }}
                            >
                                Cancelled
                            </button>
                        </div>

                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>User ID</th>
                                    <th>Name</th>
                                    <th>Status</th>
                                    <th>Date Created</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...visibleApps].sort((a, b) => new Date(b.dateOfCreation) - new Date(a.dateOfCreation)).map((app, i) => (
                                    <tr key={app.id} onClick={() => nav(routes.verification_application, { state: { app, user: users.find(u => u.id === app.userId) } })}>
                                        <td>{app.id}</td>
                                        <td>{app.userId}</td>
                                        <td>{(users.find(u => u.id === app.userId)?.firstname + " " + users.find(u => u.id === app.userId)?.lastname) || "Unknown / User Discarded"}</td>
                                        <td style={{ color: app.status === "cancelled" ? '#6b7280' : app.status === "rejected" ? "#ff0000ff" : app.status === "approved" ? "#00ff00" : "#fffb00ff" }}>
                                            {app.status === "cancelled" ? "Cancelled" : app.status === "approved" ? "Approved" : app.status === "rejected" ? "Rejected" : "Pending"}
                                        </td>
                                        <td>{new Date(app.dateOfCreation).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</td>
                                        <td>
                                            <img src={images.arrow} style={{ width: 20, height: 20, filter: "brightness(0) invert(1)" }} />
                                        </td>
                                    </tr>

                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeSection === "Reports" && (
                    <div className="admin-section">
                        <h2>Reports</h2>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Reported User ID</th>
                                    <th>Type</th>
                                    <th>Violation</th>
                                    <th>Date Created</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.map((report, i) => (
                                    <tr key={report.id} onClick={() => nav(routes.report, { state: { reporterUser: users.find(u => u.id === report.userId), reportedUser: users.find(u => u.id === report.reportedUserId), report } })}>
                                        <td>{report.id}</td>
                                        <td>{report.reportedUserId}</td>
                                        <td>{report.type ? (report.type.includes('user') ? 'User' : report.type.includes('post') ? 'Community Post' : 'Food') : 'Type Unspecified'}</td>
                                        <td>{report.offense ? report.offense : 'Violation Unspecified'}</td>
                                        <td>{new Date(report.dateOfCreation).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</td>
                                        <td>
                                            <img src={images.arrow} style={{ width: 20, height: 20, filter: "brightness(0) invert(1)" }} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeSection === "Food List" && (
                    <div className="admin-section">
                        <h2>Food List</h2>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                </tr>
                            </thead>
                            <tbody>
                                {foodList.map((f) => (
                                    <tr key={f.id}>
                                        <td>{f.id}</td>
                                        <td>{f.name}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeSection === "Community Posts" && (
                    <div className="admin-section">
                        <h2>Community Posts</h2>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Author</th>
                                    <th>Content</th>
                                </tr>
                            </thead>
                            <tbody>
                                {communityPosts.map((p) => (
                                    <tr key={p.id}>
                                        <td>{p.id}</td>
                                        <td>{p.author}</td>
                                        <td>{p.content}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeSection === "Admins" && (
                    <>
                        <div style={{ position: 'fixed', bottom: '25px', right: '25px', }}>
                            <button className="add-admin-btn" onClick={handleAddAdmin}>
                                New Admin Access
                            </button>
                        </div>
                        <div className="admin-section">
                            <h2>Admins</h2>
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>ID</th>
                                        <th>Status</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {admins.map((admin, i) => (
                                        <Fragment key={admin.id}>
                                            <tr style={{ background: expandedAdmin === admin.id ? 'rgba(59, 130, 246, 0.1)' : 'none' }} onClick={() => expandedAdmin === admin.id ? setExpandedAdmin(null) : setExpandedAdmin(admin.id)}>
                                                <td>{i + 1}</td>
                                                <td>{admin.id}</td>
                                                <td style={{ color: admin.isActive ? "#00ff00" : "#ff0000" }}>{admin.isActive ? "Active" : "Inactive"}</td>
                                                <td>
                                                    <img
                                                        src={images.arrow}
                                                        style={{
                                                            width: 20,
                                                            height: 20,
                                                            filter: "brightness(0) invert(1)",
                                                            transform: expandedAdmin === admin.id ? "rotate(90deg)" : "rotate(0deg)",
                                                            transition: "transform 0.2s ease"
                                                        }}
                                                    />
                                                </td>
                                            </tr>
                                            {expandedAdmin === admin.id && (
                                                <tr key={`${admin.id}-expanded`} className="expanded-row">
                                                    <td colSpan="5" style={{ backgroundColor: 'rgba(59, 130, 246, 0.05)', padding: '20px' }}>
                                                        <div className="admin-details">
                                                            <div className="details-grid">
                                                                <div className="detail-item">
                                                                    <strong>Access ID:</strong> {admin.accessId}
                                                                </div>
                                                                <div className="detail-item">
                                                                    <strong>Seed Admin:</strong> {admin.isSeed ? "Yes" : "No"}
                                                                </div>
                                                                <div className="detail-item">
                                                                    <strong>Created:</strong> {new Date(admin.dateOfCreation).toLocaleString("en-US")}
                                                                </div>
                                                                <div className="detail-item">
                                                                    <strong>Permissions:</strong> {admin.permissions === 'read' ? "Read Only" : formatPermissions(admin.permissions)}
                                                                </div>
                                                            </div>

                                                            {!admin.isSeed &&
                                                                <div className="expanded-actions" style={{
                                                                    display: 'flex',
                                                                    gap: '10px',
                                                                    marginTop: '20px',
                                                                    justifyContent: 'flex-end'
                                                                }}>
                                                                    <button
                                                                        className="edit-admin-btn"
                                                                        onClick={() => handleEditAdmin(admin)}
                                                                        style={{
                                                                            padding: '8px 16px',
                                                                            background: 'rgba(59, 130, 246, 0.2)',
                                                                            color: '#3b82f6',
                                                                            border: '1px solid rgba(59, 130, 246, 0.4)',
                                                                            borderRadius: '6px',
                                                                            cursor: 'pointer',
                                                                            fontSize: '14px',
                                                                            fontWeight: '500'
                                                                        }}
                                                                    >
                                                                        Edit Admin
                                                                    </button>
                                                                    <button
                                                                        className={admin.isActive ? "terminate-admin-btn" : "restore-admin-btn"}
                                                                        onClick={() => handleTerminateAdmin(admin)}
                                                                        style={{
                                                                            padding: '8px 16px',
                                                                            background: admin.isActive ? 'rgba(239, 68, 68, 0.2)' : 'rgba(143, 246, 255, 0.2)',
                                                                            color: admin.isActive ? '#ef4444' : '#3bf6c7ff',
                                                                            border: admin.isActive ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(143, 246, 255, 0.4)',
                                                                            borderRadius: '6px',
                                                                            cursor: 'pointer',
                                                                            fontSize: '14px',
                                                                            fontWeight: '500'
                                                                        }}
                                                                    >
                                                                        {admin.isActive ? "Terminate Admin" : "Restore Admin"}
                                                                    </button>
                                                                </div>
                                                            }
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}