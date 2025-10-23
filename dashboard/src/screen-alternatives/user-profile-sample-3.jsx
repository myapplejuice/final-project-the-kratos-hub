
 <main className="admin-main" style={{
                display: "flex",
                justifyContent: 'flex-start',
                flexDirection: "column",
                minHeight: '100vh',
                padding: '20px'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: "40px",
                    background: 'white',
                    borderRadius: '20px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    marginBottom: '30px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
                    border: '1px solid rgba(255,255,255,0.1)',
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        alignSelf: 'center',
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 20,
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
                        }}
                            onClick={handleBack}
                            onMouseOver={(e) => {
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
                            }}
                        >
                            <img
                                src={images.backArrow}
                                alt="Back"
                                style={{
                                    width: "20px",
                                    height: "20px",
                                    transition: 'transform 0.3s ease'
                                }}
                            />
                        </div>
                        <div style={{ justifyContent: 'center', marginLeft: 25 }}>
                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 5 }}>
                                <p style={{
                                    color: "#1e293b",
                                    margin: 0,
                                    textAlign: 'left',
                                    fontSize: '32px',
                                    lineHeight: 1,
                                    fontWeight: '700',
                                    background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}>
                                    {user.firstname + " " + user.lastname}
                                </p>
                            </div>
                            <p style={{
                                color: "#64748b",
                                margin: '5px 0 0 0',
                                textAlign: 'left',
                                fontSize: '14px',
                                background: '#f1f5f9',
                                padding: '6px 12px',
                                borderRadius: '20px',
                                display: 'inline-block'
                            }}>
                                {user.id}
                            </p>
                        </div>
                    </div>
    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <button
                                onClick={handleNotify}
                                style={{
                                    padding: '12px 24px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    color: 'white',
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    minWidth: '120px'
                                }}
                            >
                                Notify User
                            </button>
                            <button
                                onClick={handleTerminate}
                                style={{
                                    padding: '12px 24px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    background: user.isTerminated ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                    color: 'white',
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    minWidth: '120px'
                                }}
                            >
                                {user.isTerminated ? "Re-activate" : "Terminate"}
                            </button>
                            <button
                                onClick={handleWarningIssue}
                                style={{
                                    padding: '12px 24px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    background: '#ff9e30ff',
                                    color: 'white',
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    minWidth: '120px'
                                }}
                            >
                                Issue Warning
                            </button>
                        </div>
    
                        {/* Profile Picture */}
                        <div style={{ position: 'relative' }}>
                            <img
                                src={user.imageURL || images.profilePic}
                                alt="Profile"
                                style={{
                                    width: "130px",
                                    height: "130px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    border: "4px solid #60a5fa",
                                    boxShadow: '0 8px 25px rgba(96, 165, 250, 0.3)',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseOver={(e) => {
                                    e.target.style.transform = 'scale(1.05)';
                                    e.target.style.boxShadow = '0 12px 30px rgba(96, 165, 250, 0.4)';
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.transform = 'scale(1)';
                                    e.target.style.boxShadow = '0 8px 25px rgba(96, 165, 250, 0.3)';
                                }}
                            />
                        </div>
                    </div>
                </div>
    
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '30px'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                        padding: '25px',
                        borderRadius: '16px',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '20px',
                            borderBottom: '2px solid rgba(96,165,250,0.3)',
                            paddingBottom: '8px'
                        }}>
                            <p style={{
                                fontWeight: '700',
                                margin: 0,
                                fontSize: '22px',
                                color: '#60a5fa',
                            }}>Personal Profile</p>
    
                            <div style={{ display: 'flex', alignItems: 'center', background: user.isTerminated ? '#ff0000ff' : '#00c510ff', width: 'fit-content', height: 'fit-content', marginBottom: 5, padding: 0, lineHeight: 1, paddingInline: 15, borderRadius: 15, height: '30px' }}>
                                <p style={{ color: 'white', fontWeight: 'bolder', }}>{user.isTerminated ? "Terminated Account" : "Active"}</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <p style={{ color: 'white', margin: 0 }}><strong style={{ color: '#93c5fd' }}>Age:</strong> {user.age}</p>
                            <p style={{ color: 'white', margin: 0 }}><strong style={{ color: '#93c5fd' }}>Gender:</strong> {user.gender === 'male' ? 'Male' : 'Female'}</p>
                            <p style={{ color: 'white', margin: 0 }}><strong style={{ color: '#93c5fd' }}>Phone:</strong> {user.phone}</p>
                            <p style={{ color: 'white', margin: 0 }}><strong style={{ color: '#93c5fd' }}>Email:</strong> {user.email}</p>
                            <p style={{ color: 'white', margin: 0 }}><strong style={{ color: '#93c5fd' }}>Created At:</strong> {formatDate(user.dateOfCreation, { format: 'MMMM d' }) + ", " + new Date(user.dateOfCreation).getFullYear()}</p>
                        </div>
                    </div>
    
                    {/* Trainer Info Card */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                        padding: '25px',
                        borderRadius: '16px',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
                        border: '1px solid rgba(255,255,255,0.1)',
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '20px',
                            borderBottom: '2px solid rgba(96,165,250,0.3)',
                            paddingBottom: '8px'
                        }}>
                            <p style={{
                                fontWeight: '700',
                                margin: 0,
                                fontSize: '22px',
                                color: '#60a5fa',
                            }}>Trainer Profile</p>
    
                            {/* Icons next to title */}
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                {user.trainerProfile.trainerStatus === 'active' &&
                                    <img
                                        src={images.personalTrainer}
                                        alt="Active Trainer"
                                        style={{
                                            width: "35px",
                                            height: "35px",
                                            filter: 'invert(1)',
                                            transition: 'transform 0.3s ease'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    />
                                }
                                {user.trainerProfile.isVerified &&
                                    <img
                                        src={images.shield}
                                        alt="Verified"
                                        style={{
                                            width: "35px",
                                            height: "35px",
                                            filter: 'invert(1)',
                                            transition: 'transform 0.3s ease'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    />
                                }
                            </div>
                        </div>
    
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <p style={{ color: 'white', margin: 0 }}><strong style={{ color: '#93c5fd' }}>Status:</strong> {user.trainerProfile?.trainerStatus === 'active' ? "Active" : "Inactive" || "N/A"}</p>
                            <p style={{ color: 'white', margin: 0 }}><strong style={{ color: '#93c5fd' }}>Verified:</strong> {user.trainerProfile?.isVerified ? "Yes" : "No"}</p>
                            <p style={{ color: 'white', margin: 0 }}><strong style={{ color: '#93c5fd' }}>Experience:</strong> {user.trainerProfile?.yearsOfExperience || "N/A"}</p>
                            <p style={{ color: 'white', margin: 0 }}><strong style={{ color: '#93c5fd' }}>Biography:</strong> {user.trainerProfile?.biography || "No biography"}</p>
                            {user.trainerProfile?.images?.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                                    <p style={{ color: '#93c5fd', margin: 0, fontWeight: '600' }}>Certificates & Qualifications</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexWrap: 'wrap' }}>
                                        {user.trainerProfile.images.map((img, i) => (
                                            <a
                                                key={i}
                                                href={img.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    display: 'block',
                                                    padding: '12px 16px',
                                                    borderRadius: '12px',
                                                    background: 'rgba(96, 165, 250, 0.1)',
                                                    border: '2px solid rgba(96, 165, 250, 0.3)',
                                                    color: '#93c5fd',
                                                    textDecoration: 'none',
                                                    transition: 'all 0.3s ease',
                                                    cursor: 'pointer',
                                                    wordBreak: 'break-all',
                                                    fontSize: '14px',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    width: '100%'
                                                }}
                                                onMouseOver={(e) => {
                                                    e.currentTarget.style.background = 'rgba(96, 165, 250, 0.2)';
                                                    e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.5)';
                                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.background = 'rgba(96, 165, 250, 0.1)';
                                                    e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.3)';
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                }}
                                            >
                                                {img.url}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
    
    
                </div>
    
                <div style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                    padding: '25px',
                    borderRadius: '16px',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    marginTop: 30,
                    marginBottom: 300
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '20px',
                        borderBottom: '2px solid rgba(96,165,250,0.3)',
                        paddingBottom: '8px'
                    }}>
                        <p style={{
                            fontWeight: '700',
                            margin: 0,
                            fontSize: '22px',
                            color: '#60a5fa',
                        }}>Reputation</p>
    
                        <div style={{ display: 'flex', alignItems: 'center', background: reputationProfile.tier?.color, width: 'fit-content', height: 'fit-content', marginBottom: 5, padding: 0, lineHeight: 1, paddingInline: 15, borderRadius: 15, height: '30px' }}>
                            <p style={{ color: 'white', fontWeight: 'bolder', }}>{reputationProfile.tier?.label}</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <p style={{ color: 'white', margin: 0 }}><strong style={{ color: '#93c5fd' }}>Number of Reports:</strong> {reputationProfile.reportCount}</p>
                        <p style={{ color: 'white', margin: 0 }}><strong style={{ color: '#93c5fd' }}>Offenses Count:</strong> {reputationProfile.offenseCount}</p>
                        <p style={{ color: 'white', margin: 0 }}><strong style={{ color: '#93c5fd' }}>Termination Count:</strong> {reputationProfile.terminationCount}</p>
                        <p style={{ color: 'white', margin: 0 }}><strong style={{ color: '#93c5fd' }}>Reinstatement Count:</strong> {reputationProfile.reinstatementCount}</p>
                        <p style={{ color: 'white', margin: 0 }}><strong style={{ color: '#93c5fd' }}>Current Warnings:</strong> {reputationProfile.currentWarningCount}</p>
                    </div>
                </div>
            </main>










