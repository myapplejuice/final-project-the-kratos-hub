import React, { useContext, useEffect, useState } from "react";
import * as styles from "../index.css";
import APIService from "../utils/api-service";
import { useNavigate } from "react-router-dom";
import SessionStorageService from "../utils/session-storage-service";
import { usePopups } from "../utils/popups.provider";
import { images } from "../utils/assets";
import { routes } from "../utils/constants";
import colors from "../utils/stylings";

export default function Dashboard() {
    const { showMessager, hideMessager, showDialog, showSpinner, hideSpinner } = usePopups();
    const nav = useNavigate();

    const [activeSection, setActiveSection] = useState("Users");
    const [searchQuery, setSearchQuery] = useState("");
    const [admins, setAdmins] = useState([]);
    const [users, setUsers] = useState([]);
    const [verificationApps, setVerificationApps] = useState([]);
    const [visibleUsers, setVisibleUsers] = useState([]);
    const [filterTerminated, setFilterTerminated] = useState(false);


    useEffect(() => {
        async function fetchDashboardData() {
            try {
                showSpinner();
                const result = await APIService.routes.dashboardData();
                
                if (result.success) {
                    const users = result.data.users;
                    const admins = result.data.admins;
                    const applications = result.data.applications;

                    setUsers(users);
                    setAdmins(admins);
                    setVerificationApps(applications);
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

                const matchesStatus = user.isTerminated === filterTerminated;

                return matchesSearch && matchesStatus;
            });

            setVisibleUsers(filtered);
        }
    }, [users, activeSection, searchQuery, filterTerminated]);


    function handleSignOut() {
        SessionStorageService.removeItem("admin");
        nav("/");
    }

    return (
        <div className="admin-page">
            <aside className="admin-sidebar">
                <div>
                    <h2>Kratos Hub Administration</h2>
                    <ul>
                        {[
                            "Users",
                            "Verification Applications",
                            "Reports",
                            //"Community Posts",
                            //"Food List",
                        ].map((section) => (
                            <li key={section} className={activeSection === section ? "active" : ""} onClick={() => { setSearchQuery(''), setActiveSection(section) }}>
                                {section}{" "}{section === "Reports" ? "(3)" : section === "Users" ? "(3)" : section === "Food List" ? "(2)" : section === "Community Posts" ? "(2)" : "(2)"}
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <button className="admin-logout-btn" onClick={handleSignOut}>Sign Out</button>
                </div>
            </aside>

            <main className="admin-main">
                {activeSection === "Users" && (
                    <div className="admin-section" style={{ marginBottom: 300 }}>
                        <h2>Users</h2>
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
                                onClick={() => setFilterTerminated(false)}
                                className="status-btn active-btn"
                                style={{ background: !filterTerminated ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'rgba(233, 233, 233, 0.1)' }}
                            >
                                Active
                            </button>

                            <button
                                onClick={() => setFilterTerminated(true)}
                                className="status-btn terminated-btn"
                                style={{ background: filterTerminated ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'rgba(233, 233, 233, 0.1)' }}
                            >
                                Terminated
                            </button>
                        </div>

                        <table className="admin-table">
                            <thead>
                                <tr>
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

                {activeSection === "Verification Applications" && (
                    <div className="admin-section">
                        <h2>Trainer Applications</h2>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Status</th>
                                    <th>Date Created</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...verificationApps].sort((a, b) => new Date(b.dateOfCreation) - new Date(a.dateOfCreation)).map((app, i) => (
                                    <tr key={app.id} onClick={() => nav(routes.verification_application, { state: { app, user: users.find(u => u.id === app.userId) } })}>
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
                                    <th>ID</th>
                                    <th>Type</th>
                                    <th>Summary</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.map((r) => (
                                    <tr key={r.id}>
                                        <td>{r.id}</td>
                                        <td>{r.type}</td>
                                        <td>{r.summary}</td>
                                        <td>{r.date}</td>
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
            </main>
        </div>
    );
}

const reports = [
    {
        id: 101,
        type: "Bug",
        summary: "App crashes on login",
        date: "2025-10-18",
    },
    {
        id: 102,
        type: "User Report",
        summary: "Spam messages by user_88",
        date: "2025-10-19",
    },
    {
        id: 103,
        type: "Food Report",
        summary: "Spoiled protein shake",
        date: "2025-10-19",
    },
];

const foodList = [
    { id: 201, name: "Protein Shake - Chocolate" },
    { id: 202, name: "Chicken Meal - Grilled" },
];

const communityPosts = [
    { id: 301, author: "user_5", content: "My 10kg progress in 2 months!" },
    {
        id: 302,
        author: "user_12",
        content: "Looking for a workout partner in Tel Aviv",
    },
];