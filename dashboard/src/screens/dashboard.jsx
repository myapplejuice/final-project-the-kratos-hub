import React, { useContext, useEffect, useState } from "react";
import * as styles from "../index.css";
import APIService from "../utils/api-service";
import { useNavigate } from "react-router-dom";
import SessionStorageService from "../utils/session-storage-service";
import { usePopups } from "../utils/popups.provider";

export default function Dashboard() {
    const { showMessager, hideMessager, showDialog } = usePopups();
    const [activeSection, setActiveSection] = useState("Users");
    const nav = useNavigate();

    function handleSignOut() {
        SessionStorageService.removeItem("admin");
        APIService.clearAdmin();
        nav("/");
    }

    function handleNotification() {
        showMessager({
            title: "Send a Message",
            sendLabel: "Send Now",
            onSend: async () => {
                console.log('sending')
            },
        })
    }

    function handleTermination() {
        showDialog({
            title: 'User Termination',
            content: <p>Are you sure you want terminate this user?</p>,
            actions: [
                {
                    label: "Ok", color: "#cc2e2eff", onClick: async () => {
                        console.log('termination')
                    }
                },
            ],
        });
    }

    return (
        <div className="admin-page">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div>
                    <h2>Kratos Hub Administration</h2>
                    <ul>
                        {[
                            "Users",
                            "Reports",
                            "Food List",
                            "Community Posts",
                            "Trainer Applications",
                        ].map((section) => (
                            <li key={section} className={activeSection === section ? "active" : ""} onClick={() => setActiveSection(section)}>
                                {section}{" "}{section === "Reports" ? "(3)" : section === "Users" ? "(3)" : section === "Food List" ? "(2)" : section === "Community Posts" ? "(2)" : "(2)"}
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <button className="admin-logout-btn" onClick={handleSignOut}>Sign Out</button>
                </div>
            </aside>

            {/* Main content */}
            <main className="admin-main">
                <div className="admin-header">
                    <h1>Welcome, Admin</h1>
                </div>

                {activeSection === "Users" && (
                    <div className="admin-section">
                        <h2>User Management</h2>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u.id}>
                                        <td>{u.id}</td>
                                        <td>{u.name}</td>
                                        <td>{u.email}</td>
                                        <td>
                                            <button className="admin-terminate-btn" onClick={handleTermination}>Terminate</button>
                                            <button className="admin-notify-btn" onClick={handleNotification} >Notify</button>
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

                {activeSection === "Trainer Applications" && (
                    <div className="admin-section">
                        <h2>Trainer Applications</h2>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Experience</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {trainerApps.map((t) => (
                                    <tr key={t.id}>
                                        <td>{t.name}</td>
                                        <td>{t.experience}</td>
                                        <td>
                                            <button className="admin-approve-btn">Approve</button>
                                            <button className="admin-reject-btn">Reject</button>
                                        </td>
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

const users = [
    { id: 1, name: "John Doe", email: "john@example.com" },
    { id: 2, name: "Jane Smith", email: "jane@example.com" },
    { id: 3, name: "Ali Hassan", email: "ali@kratohub.com" },
];

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

const trainerApps = [
    { id: 401, name: "Chris Power", experience: "3 years" },
    { id: 402, name: "Alex Hunter", experience: "5 years" },
];