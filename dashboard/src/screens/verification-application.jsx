import React, { useEffect, useState } from "react";
import { images } from "../utils/assets";
import { useLocation, useNavigate } from "react-router-dom";
import { usePopups } from "../utils/popups.provider";
import colors from "../utils/stylings";
import APIService from "../utils/api-service";
import { routes } from "../utils/constants";

export default function VerificationApplication() {
    const { showDialog, showMessager, showOptions } = usePopups();
    const nav = useNavigate();
    const location = useLocation();
    const user = location.state?.user;
    const [app, setApp] = useState(location.state?.app);

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
        <>
            {app && app.status === 'pending' &&
                <div style={{
                    display: 'flex', gap: '15px', marginTop: '10px', width: '100%', position: 'fixed', bottom: 0, zIndex: 9999, padding: 35,
                    background: 'rgba(255, 255, 255, 0)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.3)',
                }}>
                    <button
                        onClick={() => handleApplicationAction('approve')}
                        style={{
                            flex: 1,
                            padding: '15px 20px',
                            borderRadius: '12px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: 'white',
                            fontWeight: '600',
                            fontSize: '14px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 15px rgba(16, 185, 129, 0.4)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                        }}
                    >
                        Approve Application
                    </button>
                    <button
                        onClick={() => handleApplicationAction('reject')}
                        style={{
                            flex: 1,
                            padding: '15px 20px',
                            borderRadius: '12px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            color: 'white',
                            fontWeight: '600',
                            fontSize: '14px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 15px rgba(239, 68, 68, 0.4)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                        }}
                    >
                        Reject Application
                    </button>
                </div>
            }

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
                        <div className="back-button" onClick={() => nav(-1)}>
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
                                className="action-button profile-button"
                                onClick={() => nav(routes.user_profile, { state: { user } })}

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

                <div className="profile-card" style={{ marginBottom: 300 }}>
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
        </>
    );
}