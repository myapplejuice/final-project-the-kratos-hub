import React, { useEffect, useState } from "react";
import { images } from "../utils/assets";
import { useLocation, useNavigate } from "react-router-dom";
import { usePopups } from "../utils/popups.provider";
import colors from "../utils/stylings";
import APIService from "../utils/api-service";

export default function VerificationApplication() {
    const { showDialog, showMessager, showOptions } = usePopups();
    const nav = useNavigate();
    const location = useLocation();
    const [app, setApp] = useState(location.state?.app);
    const [user, setUser] = useState(location.state?.user);
    const [reputationProfile, setReputationProfile] = useState({});

    useEffect(() => {
        if (!app) return;

        async function fetchUserReputation() {
            const result = await APIService.routes.reputationProfile({ id: app.userId });

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
    }, [app]);

    function handleBack() {
        nav(-1);
    }

    function handleViewUserProfile() {
        nav(`/admin/user-profile`, { state: { user } });
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

    function handleApplicationAction(action) {
        showDialog({
            title: `Application ${action.charAt(0).toUpperCase() + action.slice(1)}`,
            content: <p>Are you sure you want to {action} this verification application?</p>,
            actions: [
                {
                    label: "Cancel", color: "#5a5a5aff", onClick: null
                },
                {
                    label: "Confirm", color: action === 'approve' ? "#10b981" : "#ef4444", onClick: async () => {
                        // Call API to update application status
                        const result = await APIService.routes.updateApplicationStatus({
                            applicationId: app.id,
                            status: action
                        });

                        if (result.success) {
                            setApp({ ...app, status: action });
                            showDialog({
                                title: "Application Updated",
                                content: <p>Application has been {action}d successfully</p>,
                                actions: [{ label: "Ok", color: colors.primary, onClick: null }],
                            });
                        }
                    }
                }
            ],
        });
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return '#f59e0b';
            case 'approved': return '#10b981';
            case 'rejected': return '#ef4444';
            case 'cancelled': return '#6b7280';
            default: return '#6b7280';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'pending': return 'Pending Review';
            case 'approved': return 'Approved';
            case 'rejected': return 'Rejected';
            case 'cancelled': return 'Cancelled';
            default: return status;
        }
    };

    return (
        <main className="user-profile-main">
            <div style={{
                alignItems: 'center',
                justifyContent: 'center',
                display: 'flex',
                flexDirection: 'column',
                marginBlock: 40
            }}>
                <div className="user-info-header">
                    <p style={{
                        color: 'white',
                        fontSize: 40,
                        fontWeight: 'bold',
                        margin: 0,
                        background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Verification Application
                    </p>
                </div>
                <img src={images.shield} style={{
                    width: 100,
                    height: 100,
                    filter: "invert(1)",
                    marginTop: 20
                }} />
            </div>

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
                        <button
                            className="action-button profile"
                            onClick={handleViewUserProfile}
                        >
                            View User Profile
                        </button>
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

            <div className="profile-card" style={{marginBottom: 300}}>
                <div className="card-header">
                    <p className="card-title">Application Details</p>
                    <div
                        className="status-badge"
                        style={{ background: getStatusColor(app.status) }}
                    >
                        {getStatusLabel(app.status)}
                    </div>
                </div>
                <div className="card-details">
                    <div className="card-detail-row">
                        <span className="card-detail-label">Application ID:</span>
                        <span className="card-detail-value">{app.id}</span>
                    </div>
                    <div className="card-detail-row">
                        <span className="card-detail-label">Submitted:</span>
                        <span className="card-detail-value">
                            {new Date(app.dateOfCreation).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '15px' }}>
                        <span className="card-detail-label">Summary:</span>
                        <p className="card-detail-value" style={{ opacity: app.summary ? 1 : 0.7, lineHeight: '1.5' }}>
                            {app.summary || "No summary provided"}
                        </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '15px' }}>
                        <span className="card-detail-label">Education:</span>
                        <p className="card-detail-value" style={{ opacity: app.education ? 1 : 0.7, lineHeight: '1.5' }}>
                            {app.education || "No education information provided"}
                        </p>
                    </div>

                    {app.links && app.links.filter(link => link && link.trim() !== '').length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                            <p className="card-detail-label">Social Links</p>
                            <div className="certificates-list">
                                {app.links.filter(link => link && link.trim() !== '').map((link, i) => (
                                    <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="social-link">
                                        {link}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {app.images?.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                            <p className="card-detail-label">Supporting Documents</p>
                            <div className="certificates-list">
                                {app.images.map((img, i) => (
                                    <a key={i} href={img.url} target="_blank" rel="noopener noreferrer" className="certificate-link">
                                        {img.url.split('/').pop() || `Document ${i + 1}`}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}