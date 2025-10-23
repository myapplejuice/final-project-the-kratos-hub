import React, { useContext, useEffect, useRef, useState } from "react";
import { images } from "../utils/assets";
import { useLocation, useNavigate } from "react-router-dom";
import { usePopups } from "../utils/popups.provider";
import colors from "../utils/stylings";
import { formatDate } from "../utils/date-time";
import APIService from "../utils/api-service";
import * as styles from "../user-profile.css";

export default function UserProfile() {
    const { showDialog, showMessager, showOptions } = usePopups();
    const nav = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(location.state?.user);
    const [reputationProfile, setReputationProfile] = useState({});

    useEffect(() => {
        if (!user) return;

        async function fetchUserReputation() {
            const result = await APIService.routes.reputationProfile({ id: user.id });

            if (result.success) {

                const reputationProfile = result.data.reputationProfile;
                const score =
                    reputationProfile.reportCount * 1 +
                    reputationProfile.offenseCount * 2 +
                    reputationProfile.terminationCount * 5 +
                    reputationProfile.currentWarningCount * 1 -
                    reputationProfile.reinstatementCount * 2;

                let tier;
                if (score <= 1) tier = { label: "Respectable", color: "#10b981" };
                else if (score <= 3) tier = { label: "Good", color: "#3b82f6" };
                else if (score <= 6) tier = { label: "Neutral", color: "#9ca3af" };
                else if (score <= 10) tier = { label: "Concerning", color: "#f59e0b" };
                else tier = { label: "High-Risk", color: "#ef4444" };

                setReputationProfile({ ...reputationProfile, tier });
            }
        }

        fetchUserReputation();
    }, [user]);

    function handleBack() {
        nav(-1);
    }

    function handleTerminate() {
        showDialog({
            title: 'User Termination',
            content: <p>Are you sure you want terminate this user?</p>,
            actions: [
                {
                    label: "Cancel", color: "#5a5a5aff", onClick: null
                },
                {
                    label: "Yes", color: "#cc2e2eff", onClick: async () => {
                        const result = await APIService.routes.terminateUser({ id: user.id, isTerminated: !user.isTerminated });

                        if (result.success) {
                            setUser({ ...user, isTerminated: !user.isTerminated });
                        }
                    }
                }

            ],
        });
    }

    function handleNotify() {
        showMessager({
            title: "Notification",
            sendLabel: "Send",
            onSend: async (message) => {
                if (!message) return;

                showOptions({
                    title: "Notification Sentiment",
                    current: "",
                    options: [
                        { label: "Negative", color: "#cc2e2e", value: "negative" },
                        { label: "Positive", color: "#40cc2e", value: "positive" },
                        { label: "Neutral", color: "#6b6b6b", value: "normal" },
                    ],
                    onConfirm: async (chosen) => {
                        if (!chosen) return;

                        const result = await APIService.routes.notifyUser({
                            id: user.id,
                            message,
                            imagesURLS: [],
                            sentiment: chosen.value,
                        });

                        if (result.success) {
                            showDialog({
                                title: "Notification Sent",
                                content: <p>Message sent and user will be notified</p>,
                                actions: [{ label: "Ok", color: colors.primary, onClick: null }],
                            });
                        }
                    },
                });

            },
        })
    }

    function handleWarningIssue() {
        showMessager({
            title: "Warning Issue",
            sendLabel: "Send",
            placeholder: "Explain thouroughly about the reason of the warning...",
            onSend: async (summary) => {
                if (!summary) return;

                const result = await APIService.routes.warnUser({
                    id: user.id,
                    summary,
                });

                if (result.success) {
                    const warning = result.data.warning;

                    showDialog({
                        title: "Warning Issued",
                        content: <p>Warning issued and user will be notified</p>,
                        actions: [{ label: "Ok", color: colors.primary, onClick: null }],
                    });

                    setReputationProfile(prev => ({
                        ...prev,
                        warningsHistory: [warning, ...(prev.warningsHistory || []),],
                        currentWarningCount: (prev.currentWarningCount || 0) + 1,
                        offenseCount: (prev.offenseCount || 0) + 1
                    }));
                }
            },
        })
    }

    return (
        <main className="user-profile-main">
            <div className="user-profile-header">
                <div className="header-left">
                    <div className="back-button" onClick={handleBack}>
                        <img src={images.backArrow} className="back-arrow" />
                    </div>
                    <div className="user-info">
                        <div className="user-info-header">
                            <p className="user-name">{user.firstname + " " + user.lastname}</p>
                        </div>
                        <p className="user-id">{user.id}</p>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div className="action-buttons">
                        <button className="action-button notify" onClick={handleNotify}>Notify User</button>
                        <button
                            className={`action-button ${user.isTerminated ? 'reactivate' : 'terminate'}`}
                            onClick={handleTerminate}
                        >
                            {user.isTerminated ? "Re-activate" : "Terminate"}
                        </button>
                        <button className="action-button warning" onClick={handleWarningIssue}>Issue Warning</button>
                    </div>

                    <a href={user.imageURL || images.profilePic} target="_blank">
                        <div className="profile-image-wrapper">
                            <div className="profile-image-border">
                                <img src={user.imageURL || images.profilePic} alt="Profile" className="profile-image" />
                            </div>
                        </div>
                    </a>
                </div>
            </div>

            <div className="profile-grid">
                <div className="profile-card">
                    <div className="card-header">
                        <p className="card-title">Personal Profile</p>
                        <div className={`status-badge ${user.isTerminated ? 'terminated-badge' : 'active-badge'}`}>
                            {user.isTerminated ? "Terminated" : "Active"}
                        </div>
                    </div>
                    <div className="card-details">
                        <div className="card-detail-row"><span className="card-detail-label">Age:</span><span className="card-detail-value">{user.age}</span></div>
                        <div className="card-detail-row"><span className="card-detail-label">Gender:</span><span className="card-detail-value">{user.gender === 'male' ? 'Male' : 'Female'}</span></div>
                        <div className="card-detail-row"><span className="card-detail-label">Phone:</span><span className="card-detail-value">{user.phone}</span></div>
                        <div className="card-detail-row"><span className="card-detail-label">Email:</span><span className="card-detail-value">{user.email}</span></div>
                        <div className="card-detail-row"><span className="card-detail-label">Created:</span><span className="card-detail-value">{new Date(user.dateOfCreation).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span></div>
                    </div>
                </div>

                <div className="profile-card">
                    <div className="card-header">
                        <p className="card-title">Trainer Profile</p>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            {user.trainerProfile?.trainerStatus === 'active' && <div className="trainer-badge active-trainer">ACTIVE</div>}
                            {user.trainerProfile?.isVerified && <div className="trainer-badge verified-trainer">VERIFIED</div>}
                        </div>
                    </div>
                    <div className="card-details">
                        <div className="card-detail-row">
                            <span className="card-detail-label">Status:</span>
                            <span className="card-detail-value" style={{ color: user.trainerProfile?.trainerStatus === 'active' ? '#10b981' : '#ef4444' }}>
                                {user.trainerProfile?.trainerStatus === 'active' ? "Active" : "Inactive"}
                            </span>
                        </div>
                        <div className="card-detail-row">
                            <span className="card-detail-label">Verified:</span>
                            <span className="card-detail-value" style={{ color: user.trainerProfile?.isVerified ? '#10b981' : '#ef4444' }}>
                                {user.trainerProfile?.isVerified ? "Yes" : "No"}
                            </span>
                        </div>
                        <div className="card-detail-row">
                            <span className="card-detail-label">Experience:</span>
                            <span className="card-detail-value">{user.trainerProfile?.yearsOfExperience || "N/A"}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <span className="card-detail-label">Biography:</span>
                            <p className="card-detail-value" style={{ opacity: user.trainerProfile?.biography ? 1 : 0.7 }}>{user.trainerProfile?.biography || "No biography provided"}</p>
                        </div>
                        {user.trainerProfile?.images?.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                                <p className="card-detail-label">Certificates & Qualifications</p>
                                <div className="certificates-list">
                                    {user.trainerProfile.images.map((img, i) => (
                                        <a key={i} href={img.url} target="_blank" rel="noopener noreferrer">{img.url.split('/').pop() || `Certificate ${i + 1}`}</a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="profile-card" >
                <div className="card-header">
                    <p className="card-title">Reputation & Compliance</p>
                    <div className="status-badge" style={{ background: reputationProfile.tier?.color || '#60a5fa' }}>
                        {reputationProfile.tier?.label || 'Standard Tier'}
                    </div>
                </div>
                <div className="reputation-grid">
                    <div className="reputation-card"><div className="value reports">{reputationProfile.reportCount}</div><div className="label">Reports</div></div>
                    <div className="reputation-card"><div className="value offenses">{reputationProfile.offenseCount}</div><div className="label">Offenses</div></div>
                    <div className="reputation-card"><div className="value terminations">{reputationProfile.terminationCount}</div><div className="label">Terminations</div></div>
                    <div className="reputation-card"><div className="value reinstatements">{reputationProfile.reinstatementCount}</div><div className="label">Reinstatements</div></div>
                    <div className="reputation-card"><div className="value active-warnings">{reputationProfile.currentWarningCount}</div><div className="label">Active Warnings</div></div>
                </div>
            </div>

            <div className="profile-card warnings-history-card" style={{ marginTop: 30, marginBottom: 330 }}>
                <div className="card-header">
                    <p className="card-title">Warnings History</p>
                </div>

                <div className="warnings-list">
                    {reputationProfile.warningsHistory?.length > 0 ? (
                        reputationProfile.warningsHistory.map((warning, index) => {
                            const isCurrent =
                                index < reputationProfile.currentWarningCount;

                            return (
                                <div
                                    key={index}
                                    className={`warning-item ${isCurrent ? "current-warning" : ""}`}
                                >
                                    <div className="warning-top">
                                        <span className="warning-date">
                                            {new Date(warning.dateOfCreation).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}{" "}
                                            {new Date(warning.dateOfCreation).toLocaleTimeString('en-US', {
                                                hour: 'numeric',
                                                minute: 'numeric',
                                                hour12: true
                                            })}
                                        </span>
                                        <span className="warning-admin">Admin ID: {warning.adminId}</span>
                                    </div>

                                    <p className="warning-summary">{warning.summary}</p>

                                    {warning.imagesURLS && warning.imagesURLS !== "[]" && (
                                        <div className="warning-images">
                                            {JSON.parse(warning.imagesURLS).map((imgUrl, i) => (
                                                <a
                                                    key={i}
                                                    href={imgUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="warning-image-link"
                                                >
                                                    {imgUrl.split("/").pop()}
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <p className="no-warnings">No warnings found</p>
                    )}
                </div>
            </div>
        </main>
    );


}