import React, { useEffect, useState } from "react";
import { images } from "../utils/assets";
import { useLocation, useNavigate } from "react-router-dom";
import { usePopups } from "../utils/popups.provider";
import colors from "../utils/stylings";
import APIService from "../utils/api-service";
import { routes } from "../utils/constants";
import SessionStorageService from "../utils/session-storage-service";

export default function VerificationApplication() {
    const admin = SessionStorageService.getItem("admin").admin;
    const { showDialog, showMessager, showOptions, showAlert } = usePopups();
    const nav = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(location.state?.user);
    const [app, setApp] = useState(location.state?.app);
    const [note, setNote] = useState('');

    function handleApplicationAction(action) {
        if (!note) return showAlert({ title: "Note Required", message: "Please provide a note for them to know reasoning of your decision", });

        showDialog({
            title: `Application ${action === 'approve' ? 'Approval' : 'Rejection'}`,
            content: <p>Are you sure you want to {action} this verification application?</p>,
            actions: [
                { label: "Cancel", color: "#5a5a5aff", onClick: null },
                {
                    label: "Confirm", color: action === 'approve' ? "#10b981" : "#ef4444", onClick: async () => {

                        const result = await APIService.routes.updateApplication({
                            userId: user.id,
                            applicationId: app.id,
                            status: action,
                            adminReply: note
                        });

                        if (result.success) {
                            setUser({ ...user, trainerProfile: { ...user.trainerProfile, trainerStatus: user.trainerProfile.trainerStatus === 'inactive' ? (action === 'rejected' ? 'inactive' : 'active') : 'active', isVerified: action === 'rejected' ? false : true } });
                            setApp({ ...app, status: action, adminReply: note });
                            showDialog({
                                title: "Application Updated",
                                content: <p>Application has been {action}d</p>,
                                actions: [{ label: "Ok", color: colors.primary, onClick: null }],
                            });
                        }
                    }
                }
            ],
        });
    }

    function getStatusColor(status) {
        switch (status) {
            case 'pending': return '#f59e0b';
            case 'approved': return '#10b981';
            case 'rejected': return '#ef4444';
            case 'cancelled': return '#6b7280';
            default: return '#6b7280';
        }
    };

    function getStatusLabel(status) {
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
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
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

                <div className="profile-card" style={{ marginBottom: 30 }}>
                    <div className="card-header">
                        <p className="card-title">Application Details</p>
                        <div
                            className="status-badge"
                            style={{ background: getStatusColor(app.status) }}
                        >
                            {getStatusLabel(app.status === 'approved' ? 'Approved' : app.status === 'rejected' ? 'Rejected' : app.status === 'cancelled' ? 'Cancelled' : 'Pending Review')}
                        </div>
                    </div>
                    <div className="card-details">
                        <div className="card-detail-row">
                            <span className="card-detail-label">Application ID:</span>
                            <span className="card-detail-value">{app.id}</span>
                        </div>
                        <div className="card-detail-row">
                            <span className="card-detail-label">Date of Submittion:</span>
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

                <div className="profile-card" style={{ marginBottom: 300 }}>

                    <div className="card-header">
                        <p className="card-title">Application Review</p>
                        {app.status === 'pending' &&
                            <div style={{
                                background: '#f59e0b',
                                padding: '6px 12px',
                                borderRadius: '15px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                color: 'white'
                            }}>
                                ACTION REQUIRED
                            </div>
                        }
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 0' }}>
                        <div>
                            <label style={{
                                display: 'block',
                                color: '#93c5fd',
                                fontWeight: '600',
                                marginBottom: '10px',
                                fontSize: '14px'
                            }}>
                                Review Notes & Message to User:
                            </label>

                            {(app.status === 'pending' && (admin.permissions.includes('all') || admin.permissions.includes('verifications'))) ? (
                                <textarea
                                    placeholder="Enter your review notes, feedback, or message that will be sent to the user..."
                                    style={{
                                        width: '100%',
                                        minHeight: '120px',
                                        padding: '15px',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(96, 165, 250, 0.3)',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        color: 'white',
                                        fontSize: '14px',
                                        resize: 'vertical',
                                        fontFamily: 'inherit',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                                        e.target.style.borderColor = 'rgba(96, 165, 250, 0.6)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                                        e.target.style.borderColor = 'rgba(96, 165, 250, 0.3)';
                                    }}
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                />
                            ) : (
                                <p style={{
                                    width: '100%',
                                    minHeight: '120px',
                                    padding: '15px',
                                    borderRadius: '12px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    color: 'white',
                                    fontSize: '14px',
                                    fontFamily: 'inherit',
                                    margin: 0,
                                    whiteSpace: 'pre-wrap'
                                }}>
                                    {app.adminReply || "No review notes provided."}
                                </p>
                            )}
                        </div>

                        {app.status === 'pending' && (admin.permissions.includes('all') || admin.permissions.includes('verifications')) &&
                            <>
                                <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                                    <button
                                        onClick={() => handleApplicationAction('approved')}
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
                                        onClick={() => handleApplicationAction('rejected')}
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

                                <p style={{
                                    color: '#64748b',
                                    margin: 0,
                                    fontSize: '12px',
                                    textAlign: 'center',
                                    fontStyle: 'italic'
                                }}>
                                    Your review notes will be included in the notification sent to the user
                                </p>
                            </>
                        }
                    </div>
                </div>
            </main>
        </>
    );
}