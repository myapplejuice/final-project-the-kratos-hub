
  return (
    <main style={{
      display: "flex",
      justifyContent: 'flex-start',
      flexDirection: "column",
      minHeight: '100vh',
      padding: '20px',
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
    }}>
      {/* Enhanced Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: "40px",
        borderRadius: '20px',
        marginBottom: '30px',
        backgroundColor: 'rgba(255,255,255,0.05)',
        boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
        border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
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
              e.currentTarget.style.transform = 'translateX(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            <img src={images.backArrow}  style={{ width: '24px', height: '24px', marginRight: 2 }} />
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
              background: 'rgba(241, 245, 249, 0.1)',
              padding: '6px 12px',
              borderRadius: '20px',
              display: 'inline-block',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              {user.id}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '10px',
            background: 'rgba(255,255,255,0.03)',
            padding: '15px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
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
                minWidth: '120px',
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
                minWidth: '120px',
                boxShadow: user.isTerminated 
                  ? '0 4px 12px rgba(59, 130, 246, 0.3)'
                  : '0 4px 12px rgba(239, 68, 68, 0.3)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = user.isTerminated 
                  ? '0 6px 15px rgba(59, 130, 246, 0.4)'
                  : '0 6px 15px rgba(239, 68, 68, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = user.isTerminated 
                  ? '0 4px 12px rgba(59, 130, 246, 0.3)'
                  : '0 4px 12px rgba(239, 68, 68, 0.3)';
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
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: 'white',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                minWidth: '120px',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 15px rgba(245, 158, 11, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
              }}
            >
              Issue Warning
            </button>
          </div>

          <div style={{ position: 'relative' }}>
            <div style={{
              width: "130px",
              height: "130px",
              borderRadius: "50%",
              background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
              padding: '3px'
            }}>
              <img
                src={user.imageURL || '/default-avatar.png'}
                alt="Profile"
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "3px solid rgba(255,255,255,0.1)",
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
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '30px',
        marginBottom: '30px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
          padding: '25px',
          borderRadius: '16px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          flexDirection: 'column'
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

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              background: user.isTerminated ? '#ef4444' : '#10b981', 
              width: 'fit-content', 
              height: 'fit-content', 
              marginBottom: 5, 
              padding: 0, 
              lineHeight: 1, 
              paddingInline: 15, 
              borderRadius: 15, 
              height: '30px' 
            }}>
              <p style={{ color: 'white', fontWeight: 'bolder', fontSize: '12px' }}>
                {user.isTerminated ? "Terminated" : "Active"}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#93c5fd', fontWeight: '600' }}>Age:</span>
              <span style={{ color: 'white' }}>{user.age}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#93c5fd', fontWeight: '600' }}>Gender:</span>
              <span style={{ color: 'white' }}>{user.gender === 'male' ? 'Male' : 'Female'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#93c5fd', fontWeight: '600' }}>Phone:</span>
              <span style={{ color: 'white' }}>{user.phone}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#93c5fd', fontWeight: '600' }}>Email:</span>
              <span style={{ color: 'white' }}>{user.email}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#93c5fd', fontWeight: '600' }}>Created:</span>
              <span style={{ color: 'white' }}>
                {new Date(user.dateOfCreation).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
          padding: '25px',
          borderRadius: '16px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          flexDirection: 'column'
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

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {user.trainerProfile?.trainerStatus === 'active' && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.2)',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}>
                  <span style={{ color: '#10b981', fontSize: '12px', fontWeight: '600' }}>ACTIVE</span>
                </div>
              )}
              {user.trainerProfile?.isVerified && (
                <div style={{
                  background: 'rgba(59, 130, 246, 0.2)',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  border: '1px solid rgba(59, 130, 246, 0.3)'
                }}>
                  <span style={{ color: '#3b82f6', fontSize: '12px', fontWeight: '600' }}>VERIFIED</span>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#93c5fd', fontWeight: '600' }}>Status:</span>
              <span style={{ 
                color: user.trainerProfile?.trainerStatus === 'active' ? '#10b981' : '#ef4444',
                fontWeight: '600'
              }}>
                {user.trainerProfile?.trainerStatus === 'active' ? "Active" : "Inactive"}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#93c5fd', fontWeight: '600' }}>Verified:</span>
              <span style={{ 
                color: user.trainerProfile?.isVerified ? '#10b981' : '#ef4444',
                fontWeight: '600'
              }}>
                {user.trainerProfile?.isVerified ? "Yes" : "No"}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#93c5fd', fontWeight: '600' }}>Experience:</span>
              <span style={{ color: 'white' }}>{user.trainerProfile?.yearsOfExperience || "N/A"}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ color: '#93c5fd', fontWeight: '600' }}>Biography:</span>
              <p style={{ 
                color: 'white', 
                margin: 0, 
                fontSize: '14px',
                lineHeight: '1.4',
                opacity: user.trainerProfile?.biography ? 1 : 0.7
              }}>
                {user.trainerProfile?.biography || "No biography provided"}
              </p>
            </div>
            
            {user.trainerProfile?.images?.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                <p style={{ color: '#93c5fd', margin: 0, fontWeight: '600' }}>Certificates & Qualifications</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                        fontSize: '14px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
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
                      {img.url.split('/').pop() || `Certificate ${i + 1}`}
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
        marginBottom: 400
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
          }}>Reputation & Compliance</p>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            background: reputationProfile.tier?.color || '#60a5fa', 
            width: 'fit-content', 
            height: 'fit-content', 
            marginBottom: 5, 
            padding: 0, 
            lineHeight: 1, 
            paddingInline: 15, 
            borderRadius: 15, 
            height: '30px' 
          }}>
            <p style={{ color: 'white', fontWeight: 'bolder', fontSize: '12px' }}>
              {reputationProfile.tier?.label || 'Standard Tier'}
            </p>
          </div>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '20px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '28px',
              fontWeight: '800',
              color: '#ef4444',
              marginBottom: '8px'
            }}>
              {reputationProfile.reportCount}
            </div>
            <div style={{ color: '#93c5fd', fontSize: '14px', fontWeight: '600' }}>
              Reports
            </div>
          </div>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '28px',
              fontWeight: '800',
              color: '#f59e0b',
              marginBottom: '8px'
            }}>
              {reputationProfile.offenseCount}
            </div>
            <div style={{ color: '#93c5fd', fontSize: '14px', fontWeight: '600' }}>
              Offenses
            </div>
          </div>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '28px',
              fontWeight: '800',
              color: '#dc2626',
              marginBottom: '8px'
            }}>
              {reputationProfile.terminationCount}
            </div>
            <div style={{ color: '#93c5fd', fontSize: '14px', fontWeight: '600' }}>
              Terminations
            </div>
          </div>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '28px',
              fontWeight: '800',
              color: '#3b82f6',
              marginBottom: '8px'
            }}>
              {reputationProfile.reinstatementCount}
            </div>
            <div style={{ color: '#93c5fd', fontSize: '14px', fontWeight: '600' }}>
              Reinstatements
            </div>
          </div>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '28px',
              fontWeight: '800',
              color: '#f59e0b',
              marginBottom: '8px'
            }}>
              {reputationProfile.currentWarningCount}
            </div>
            <div style={{ color: '#93c5fd', fontSize: '14px', fontWeight: '600' }}>
              Active Warnings
            </div>
          </div>
        </div>
      </div>
    </main>
  );