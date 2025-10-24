import React, { useEffect, useState } from "react";
import { images } from "../utils/assets";
import { useLocation, useNavigate } from "react-router-dom";
import { usePopups } from "../utils/popups.provider";
import colors from "../utils/stylings";
import APIService from "../utils/api-service";
import { routes } from "../utils/constants";
import SessionStorageService from "../utils/session-storage-service";

export default function UserReport() {
    const admin = SessionStorageService.getItem("admin").admin;
    const { showDialog, showMessager, showOptions, showAlert, showSpinner, hideSpinner } = usePopups();
    const nav = useNavigate();
    const location = useLocation();
    const [report, setReport] = useState(location.state?.report);
    const [reporterUser, setReporterUser] = useState(location.state?.reporterUser);
    const [reportedUser, setReportedUser] = useState(location.state?.reportedUser);
    const [adminNote, setAdminNote] = useState(report?.adminNote || '');
    const [isResolved, setIsResolved] = useState(report?.resolved || false);

    function handleResolveReport() {
        if (!adminNote && !isResolved) {
            return showAlert({
                title: "Note Required",
                message: "Please provide an admin note before resolving the report"
            });
        }

        showDialog({
            title: `${isResolved ? 'Re-open' : 'Resolve'} Report`,
            content: <p>Are you sure you want to {isResolved ? 're-open' : 'resolve'} this report?</p>,
            actions: [
                { label: "Cancel", color: "#5a5a5aff", onClick: null },
                {
                    label: "Confirm",
                    color: isResolved ? "#f59e0b" : "#10b981",
                    onClick: async () => {
                        try {
                            showSpinner();
                            const result = await APIService.routes.updateReport({
                                reportId: report.id,
                                resolved: !isResolved,
                                adminNote: adminNote
                            });

                            if (result.success) {
                                setReport({
                                    ...report,
                                    resolved: !isResolved,
                                    adminNote: adminNote
                                });
                                setIsResolved(!isResolved);
                                showDialog({
                                    title: "Report Updated",
                                    content: <p>Report has been {!isResolved ? 'resolved' : 're-opened'}</p>,
                                    actions: [{ label: "Ok", color: colors.primary, onClick: null }],
                                });
                            }
                        } catch (error) {
                            console.error("Error updating report:", error);
                            showAlert({ title: "Error", message: "Failed to update report" });
                        } finally {
                            hideSpinner();
                        }
                    }
                }
            ],
        });
    }

    function getReportTypeLabel(type) {
        if (type.includes('post')) return 'Content Report';
        if (type.includes('food')) return 'Food Report';
        if (type === 'user') return 'User Report';
        return 'Report';
    };

    function getReportedEntity() {
        if (report.type === 'user') {
            return reportedUser ? `${reportedUser.firstname} ${reportedUser.lastname}` : 'Unknown User';
        } else if (report.type.includes('post')) {
            const postId = report.type?.replace('post-', '') || 'Unknown';
            return `Post #${postId}`;
        } else if (report.type.includes('food')) {
            const foodId = report.type?.replace('food-', '') || 'Unknown';
            return `Food Item #${foodId}`;
        }
        return 'Unknown';
    }

    function getReportedEntityType() {
        if (report.type === 'user') return 'User';
        if (report.type.includes('post')) return 'Post';
        if (report.type.includes('food')) return 'Food Item';
        return 'Content';
    }

    return (
        <>
            <main className="user-profile-main">
                <div className="user-profile-header">
                    <div className="header-left">
                        <div className="back-button" onClick={() => nav(-1)}>
                            <img src={images.backArrow} className="back-arrow" />
                        </div>
                        <div className="user-info">
                            <div className="user-info-header">
                                <p className="user-name">{getReportTypeLabel(report.type)}</p>
                            </div>
                            <p className="user-id">Report #{report.id}</p>
                        </div>
                    </div>
                    
                    <img src={images.warning} style={{
                        width: 70,
                        height: 70,
                        filter: "invert(1)",
                    }} />
                </div>

                <div className="profile-card" style={{ marginBottom: 30 }}>
                    <div className="card-header">
                        <p className="card-title">Report Overview</p>
                        <div
                            className="status-badge"
                            style={{
                                background: isResolved ? '#10b981' : '#ef4444',
                                color: 'white'
                            }}
                        >
                            {isResolved ? 'Resolved' : 'Active'}
                        </div>
                    </div>
                    <div className="card-details">
                        <div className="card-detail-row">
                            <span className="card-detail-label">Offense:</span>
                            <span
                                className="card-detail-value"
                                style={{
                                    color: '#ef4444',
                                    fontWeight: '600'
                                }}
                            >
                                {report.offense || 'Violation Unspecified'}
                            </span>
                        </div>
                        <div className="card-detail-row">
                            <span className="card-detail-label">Report Type:</span>
                            <span className="card-detail-value">{getReportTypeLabel(report.type)}</span>
                        </div>
                        <div className="card-detail-row">
                            <span className="card-detail-label">Reported User ID:</span>
                            <span className="card-detail-value">
                                {report.reportedUserId}
                            </span>
                        </div>
                        <div className="card-detail-row">
                            <span className="card-detail-label">Date of Submittion:</span>
                            <span className="card-detail-value">
                                {new Date(report.dateOfCreation).toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="profile-card" style={{ marginBottom: 30 }}>
                    <div className="card-header">
                        <p className="card-title">User Information</p>
                    </div>
                    <div className="card-details">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div style={{ padding: '15px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '8px' }}>
                                <h4 style={{ color: '#60a5fa', margin: '0 0 10px 0', fontSize: '14px' }}>
                                    Reported By
                                </h4>
                                {reporterUser ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <img
                                            src={reporterUser.imageURL || images.profilePic}
                                            alt="Reporter"
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '50%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                        <div>
                                            <p style={{ margin: 0, fontWeight: '600', color: 'white' }}>
                                                {reporterUser.firstname} {reporterUser.lastname}
                                            </p>
                                            <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                                                {reporterUser.id}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <p style={{ color: '#94a3b8', margin: 0 }}>Loading reporter info...</p>
                                )}
                                <button
                                    onClick={() => reporterUser && nav(routes.user_profile, { state: { user: reporterUser } })}
                                    className="action-button profile-button"
                                    style={{
                                        marginTop: '10px',
                                        padding: '8px 16px',
                                        fontSize: '12px'
                                    }}
                                    disabled={!reporterUser}
                                >
                                    View Reporter Profile
                                </button>
                            </div>

                            <div style={{ padding: '15px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '8px' }}>
                                <h4 style={{ color: '#ef4444', margin: '0 0 10px 0', fontSize: '14px' }}>
                                    Reported {getReportedEntityType()}
                                </h4>
                                {report.type === 'user' && reportedUser ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <img
                                            src={reportedUser.imageURL || images.profilePic}
                                            alt="Reported User"
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '50%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                        <div>
                                            <p style={{ margin: 0, fontWeight: '600', color: 'white' }}>
                                                {reportedUser.firstname} {reportedUser.lastname}
                                            </p>
                                            <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                                                {reportedUser.id}
                                            </p>
                                        </div>
                                    </div>
                                ) : report.type === 'user' ? (
                                    <p style={{ color: '#94a3b8', margin: 0 }}>Loading reported user info...</p>
                                ) : (
                                    <div>
                                        <p style={{ color: 'white', margin: 0, fontWeight: '600' }}>
                                            {getReportedEntity()}
                                        </p>
                                        <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '12px' }}>
                                            {report.type.includes('post') ? 'Community Post' : 'Food Database Item'}
                                        </p>
                                    </div>
                                )}
                                {report.type === 'user' && reportedUser && (
                                    <button
                                        onClick={() => nav(routes.user_profile, { state: { user: reportedUser } })}
                                        className="action-button-red profile-button"
                                        style={{
                                            marginTop: '10px',
                                            padding: '8px 16px',
                                            fontSize: '12px',
                                            background: 'rgba(239, 68, 68, 1)',
                                            border: '1px solid rgba(239, 68, 68, 0.4)'
                                        }}
                                    >
                                        View Reported Profile
                                    </button>
                                )}
                                {(report.type.includes('post') || report.type.includes('food')) && (
                                    <button
                                        onClick={() => showAlert({
                                            title: "Content Management",
                                            message: `This would navigate to the ${report.type.includes('post') ? 'post' : 'food item'} management page`
                                        })}
                                        className="action-button-red profile-button"
                                        style={{
                                            marginTop: '10px',
                                            padding: '8px 16px',
                                            fontSize: '12px',
                                            background: 'rgba(239, 68, 68, 1)',
                                            border: '1px solid rgba(239, 68, 68, 0.4)'
                                        }}
                                    >
                                        {report.type.includes('post') ? 'Post Profile' : 'Food Profile'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="profile-card" style={{ marginBottom: 30 }}>
                    <div className="card-header">
                        <p className="card-title">Report Details</p>
                    </div>
                    <div className="card-details">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <span className="card-detail-label">Summary:</span>
                                <p className="card-detail-value" style={{
                                    opacity: report.summary ? 1 : 0.7,
                                    lineHeight: '1.5',
                                    marginTop: '8px',
                                    padding: '12px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    borderRadius: '8px'
                                }}>
                                    {report.summary || "No explanation provided."}
                                </p>
                            </div>

                            {report.imagesURLS?.length > 0 && (
                                <div>
                                    <span className="card-detail-label">Attached Evidence:</span>
                                    <div className="certificates-list" style={{ marginTop: '8px' }}>
                                        {report.imagesURLS.map((img, i) => (
                                            <a key={i} href={img} target="_blank" rel="noopener noreferrer" className="certificate-link">
                                                {img.split('/').pop() || `Evidence ${i + 1}`}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="profile-card" style={{ marginBottom: 300 }}>
                    <div className="card-header">
                        <p className="card-title">Admin Review (Internal)</p>
                        {!isResolved && (
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
                        )}
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
                                Summary:
                            </label>

                            <textarea
                                placeholder="Enter your review summary, actions taken and any additional notes..."
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
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                                disabled={isResolved}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                            <button
                                onClick={handleResolveReport}
                                style={{
                                    flex: 1,
                                    padding: '15px 20px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    background: isResolved
                                        ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                                        : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    color: 'white',
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    boxShadow: isResolved
                                        ? '0 4px 12px rgba(245, 158, 11, 0.3)'
                                        : '0 4px 12px rgba(16, 185, 129, 0.3)'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = isResolved
                                        ? '0 6px 15px rgba(245, 158, 11, 0.4)'
                                        : '0 6px 15px rgba(16, 185, 129, 0.4)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = isResolved
                                        ? '0 4px 12px rgba(245, 158, 11, 0.3)'
                                        : '0 4px 12px rgba(16, 185, 129, 0.3)';
                                }}
                            >
                                {isResolved ? 'Re-open Report' : 'Resolve Report'}
                            </button>
                        </div>

                        <p style={{
                            color: '#64748b',
                            margin: 0,
                            fontSize: '12px',
                            textAlign: 'center',
                            fontStyle: 'italic'
                        }}>
                            {isResolved
                                ? 'This report has been resolved. You can re-open it if needed.'
                                : 'Admin notes are for internal use and will be visible to other administrators'
                            }
                        </p>
                    </div>
                </div>
            </main>
        </>
    );
}