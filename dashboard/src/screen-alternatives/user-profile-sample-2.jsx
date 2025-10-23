// Version 1: Fresh Modern Design
const AdminPanelV1 = ({ user, reputationProfile, handleBack, handleNotify, handleTerminate, handleWarningIssue }) => {
  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      padding: '24px',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Header Section */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '32px',
        marginBottom: '32px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
      }}>
        {/* User Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <button
            onClick={handleBack}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(102, 126, 234, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
            }}
          >
            <span style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>←</span>
          </button>
          
          <div>
            <h1 style={{
              fontSize: '36px',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: '0 0 8px 0'
            }}>
              {user.firstname} {user.lastname}
            </h1>
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '8px 16px',
              borderRadius: '20px',
              display: 'inline-block'
            }}>
              <span style={{ color: '#cbd5e1', fontSize: '14px', fontWeight: '500' }}>
                ID: {user.id}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons & Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={handleNotify}
              style={{
                padding: '14px 28px',
                borderRadius: '14px',
                border: 'none',
                background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                color: 'white',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                minWidth: '140px',
                boxShadow: '0 8px 20px rgba(72, 187, 120, 0.3)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 25px rgba(72, 187, 120, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(72, 187, 120, 0.3)';
              }}
            >
              📧 Notify User
            </button>
            <button
              onClick={handleTerminate}
              style={{
                padding: '14px 28px',
                borderRadius: '14px',
                border: 'none',
                background: user.isTerminated 
                  ? 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)' 
                  : 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)',
                color: 'white',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                minWidth: '140px',
                boxShadow: user.isTerminated 
                  ? '0 8px 20px rgba(66, 153, 225, 0.3)'
                  : '0 8px 20px rgba(245, 101, 101, 0.3)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = user.isTerminated 
                  ? '0 12px 25px rgba(66, 153, 225, 0.4)'
                  : '0 12px 25px rgba(245, 101, 101, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = user.isTerminated 
                  ? '0 8px 20px rgba(66, 153, 225, 0.3)'
                  : '0 8px 20px rgba(245, 101, 101, 0.3)';
              }}
            >
              {user.isTerminated ? '🔄 Re-activate' : '⛔ Terminate'}
            </button>
            <button
              onClick={handleWarningIssue}
              style={{
                padding: '14px 28px',
                borderRadius: '14px',
                border: 'none',
                background: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)',
                color: 'white',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                minWidth: '140px',
                boxShadow: '0 8px 20px rgba(237, 137, 54, 0.3)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 25px rgba(237, 137, 54, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(237, 137, 54, 0.3)';
              }}
            >
              ⚠️ Issue Warning
            </button>
          </div>

          {/* Profile Picture */}
          <div style={{
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '4px',
            boxShadow: '0 12px 30px rgba(102, 126, 234, 0.4)'
          }}>
            <img
              src={user.imageURL || '/default-avatar.png'}
              alt="Profile"
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'scale(1)';
              }}
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Personal Profile Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '28px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            paddingBottom: '16px',
            borderBottom: '2px solid rgba(102, 126, 234, 0.3)'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#667eea',
              margin: 0
            }}>
              👤 Personal Profile
            </h2>
            <div style={{
              background: user.isTerminated ? '#e53e3e' : '#48bb78',
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '700',
              color: 'white'
            }}>
              {user.isTerminated ? 'Terminated' : 'Active'}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#cbd5e1', fontWeight: '500' }}>Age</span>
              <span style={{ color: 'white', fontWeight: '600' }}>{user.age}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#cbd5e1', fontWeight: '500' }}>Gender</span>
              <span style={{ color: 'white', fontWeight: '600' }}>{user.gender === 'male' ? 'Male' : 'Female'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#cbd5e1', fontWeight: '500' }}>Phone</span>
              <span style={{ color: 'white', fontWeight: '600' }}>{user.phone}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#cbd5e1', fontWeight: '500' }}>Email</span>
              <span style={{ color: 'white', fontWeight: '600' }}>{user.email}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#cbd5e1', fontWeight: '500' }}>Member Since</span>
              <span style={{ color: 'white', fontWeight: '600' }}>
                {new Date(user.dateOfCreation).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Trainer Profile Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '28px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            paddingBottom: '16px',
            borderBottom: '2px solid rgba(102, 126, 234, 0.3)'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#667eea',
              margin: 0
            }}>
              💪 Trainer Profile
            </h2>
            <div style={{ display: 'flex', gap: '12px' }}>
              {user.trainerProfile?.trainerStatus === 'active' && (
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: 'rgba(72, 187, 120, 0.2)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ color: '#48bb78', fontSize: '16px' }}>✓</span>
                </div>
              )}
              {user.trainerProfile?.isVerified && (
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: 'rgba(66, 153, 225, 0.2)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ color: '#4299e1', fontSize: '16px' }}>🛡️</span>
                </div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#cbd5e1', fontWeight: '500' }}>Status</span>
              <span style={{ 
                color: user.trainerProfile?.trainerStatus === 'active' ? '#48bb78' : '#e53e3e', 
                fontWeight: '600' 
              }}>
                {user.trainerProfile?.trainerStatus === 'active' ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#cbd5e1', fontWeight: '500' }}>Verified</span>
              <span style={{ 
                color: user.trainerProfile?.isVerified ? '#48bb78' : '#e53e3e', 
                fontWeight: '600' 
              }}>
                {user.trainerProfile?.isVerified ? 'Yes' : 'No'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#cbd5e1', fontWeight: '500' }}>Experience</span>
              <span style={{ color: 'white', fontWeight: '600' }}>
                {user.trainerProfile?.yearsOfExperience || 'N/A'} years
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ color: '#cbd5e1', fontWeight: '500' }}>Biography</span>
              <p style={{ 
                color: 'white', 
                margin: 0, 
                fontSize: '14px',
                lineHeight: '1.5',
                opacity: user.trainerProfile?.biography ? 1 : 0.7
              }}>
                {user.trainerProfile?.biography || 'No biography provided'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reputation Section */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '28px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '2px solid rgba(102, 126, 234, 0.3)'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#667eea',
            margin: 0
          }}>
            📊 Reputation & Compliance
          </h2>
          <div style={{
            background: reputationProfile.tier?.color || '#667eea',
            padding: '8px 20px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '700',
            color: 'white'
          }}>
            {reputationProfile.tier?.label || 'Standard'}
          </div>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            padding: '20px',
            borderRadius: '16px',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <div style={{
              fontSize: '32px',
              fontWeight: '800',
              color: '#f56565',
              marginBottom: '8px'
            }}>
              {reputationProfile.reportCount}
            </div>
            <div style={{ color: '#cbd5e1', fontSize: '14px', fontWeight: '500' }}>
              Reports
            </div>
          </div>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            padding: '20px',
            borderRadius: '16px',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <div style={{
              fontSize: '32px',
              fontWeight: '800',
              color: '#ed8936',
              marginBottom: '8px'
            }}>
              {reputationProfile.offenseCount}
            </div>
            <div style={{ color: '#cbd5e1', fontSize: '14px', fontWeight: '500' }}>
              Offenses
            </div>
          </div>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            padding: '20px',
            borderRadius: '16px',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <div style={{
              fontSize: '32px',
              fontWeight: '800',
              color: '#e53e3e',
              marginBottom: '8px'
            }}>
              {reputationProfile.terminationCount}
            </div>
            <div style={{ color: '#cbd5e1', fontSize: '14px', fontWeight: '500' }}>
              Terminations
            </div>
          </div>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            padding: '20px',
            borderRadius: '16px',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <div style={{
              fontSize: '32px',
              fontWeight: '800',
              color: '#4299e1',
              marginBottom: '8px'
            }}>
              {reputationProfile.reinstatementCount}
            </div>
            <div style={{ color: '#cbd5e1', fontSize: '14px', fontWeight: '500' }}>
              Reinstatements
            </div>
          </div>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            padding: '20px',
            borderRadius: '16px',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <div style={{
              fontSize: '32px',
              fontWeight: '800',
              color: '#ed8936',
              marginBottom: '8px'
            }}>
              {reputationProfile.currentWarningCount}
            </div>
            <div style={{ color: '#cbd5e1', fontSize: '14px', fontWeight: '500' }}>
              Active Warnings
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};