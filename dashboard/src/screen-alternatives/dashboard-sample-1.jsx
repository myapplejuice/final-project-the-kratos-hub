return (
    <div className="admin-page">
        <aside className="admin-sidebar">
            <div>
                <h2>Kratos Hub Administration</h2>
                <ul>
                    {[
                        { name: "Users", icon: "👥", badge: null },
                        { name: "Verification Applications", icon: "📋", badge: verificationApps.filter(app => app.status === "pending").length },
                        { name: "Reports", icon: "📊", badge: null },
                        { name: "Admins", icon: "🛡️", badge: null },
                    ].map((section) => (
                        <li
                            key={section.name}
                            className={activeSection === section.name ? "active" : ""}
                            onClick={() => { setSearchQuery(''); setActiveSection(section.name); }}
                        >
                            <span className="section-icon">{section.icon}</span>
                            {section.name}
                            {section.badge > 0 && (
                                <span className="section-badge">{section.badge}</span>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="sidebar-footer">
                <div className="admin-info">
                    <div className="admin-avatar">
                        {admin.accessId?.charAt(0).toUpperCase()}
                    </div>
                    <div className="admin-details">
                        <span className="admin-name">{admin.accessId}</span>
                        <span className="admin-role">{admin.isSeed ? "Super Admin" : "Admin"}</span>
                    </div>
                </div>
                <button className="admin-logout-btn" onClick={() => {
                    SessionStorageService.removeItem("admin");
                    nav("/");
                }}>
                    🚪 Sign Out
                </button>
            </div>
        </aside>

        <main className="admin-main">
            {/* Header with Stats */}
            <div className="dashboard-header">
                <div className="header-stats">
                    <div className="stat-card">
                        <div className="stat-icon">👥</div>
                        <div className="stat-info">
                            <span className="stat-number">{users.length}</span>
                            <span className="stat-label">Total Users</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">📋</div>
                        <div className="stat-info">
                            <span className="stat-number">{verificationApps.length}</span>
                            <span className="stat-label">Applications</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🛡️</div>
                        <div className="stat-info">
                            <span className="stat-number">{admins.length}</span>
                            <span className="stat-label">Admins</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">⏳</div>
                        <div className="stat-info">
                            <span className="stat-number">{verificationApps.filter(app => app.status === "pending").length}</span>
                            <span className="stat-label">Pending Reviews</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Sections */}
            <div className="content-area">
                {activeSection === "Users" && (
                    <div className="section-card">
                        <div className="section-header">
                            <h2>👥 User Management</h2>
                            <div className="header-actions">
                                <div className="search-box">
                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="search-input"
                                    />
                                </div>
                                <div className="filter-tabs">
                                    {[
                                        { key: 'all', label: 'All', color: '#3b82f6' },
                                        { key: 'active', label: 'Active', color: '#10b981' },
                                        { key: 'terminated', label: 'Terminated', color: '#ef4444' }
                                    ].map(tab => (
                                        <button
                                            key={tab.key}
                                            onClick={() => setFilterTerminated(tab.key)}
                                            className={`filter-tab ${filterTerminated === tab.key ? 'active' : ''}`}
                                            style={{ '--active-color': tab.color }}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="stats-overview">
                            <div className="stat-item">
                                <span className="stat-value">{visibleUsers.length}</span>
                                <span className="stat-label">Showing</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value" style={{ color: '#10b981' }}>
                                    {users.filter(u => !u.isTerminated).length}
                                </span>
                                <span className="stat-label">Active</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value" style={{ color: '#ef4444' }}>
                                    {users.filter(u => u.isTerminated).length}
                                </span>
                                <span className="stat-label">Terminated</span>
                            </div>
                        </div>

                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>User ID</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visibleUsers.map((user) => (
                                        <tr key={user.id} onClick={() => nav(routes.user_profile, { state: { user } })}>
                                            <td className="id-cell">{user.id}</td>
                                            <td className="name-cell">
                                                <div className="user-avatar">
                                                    {user.firstname?.charAt(0)}{user.lastname?.charAt(0)}
                                                </div>
                                                {user.firstname} {user.lastname}
                                            </td>
                                            <td>{user.email}</td>
                                            <td>
                                                <span className={`status-badge ${user.isTerminated ? 'terminated' : 'active'}`}>
                                                    {user.isTerminated ? 'Terminated' : 'Active'}
                                                </span>
                                            </td>
                                            <td>
                                                <button className="action-btn view-btn">
                                                    View Details →
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeSection === "Verification Applications" && (
                    <div className="section-card">
                        <div className="section-header">
                            <h2>📋 Verification Applications</h2>
                            <div className="header-actions">
                                <div className="search-box">
                                    <input
                                        type="text"
                                        placeholder="Search applications..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="search-input"
                                    />
                                </div>
                                <div className="filter-tabs">
                                    {[
                                        { key: 'all', label: 'All', color: '#3b82f6' },
                                        { key: 'pending', label: 'Pending', color: '#f59e0b' },
                                        { key: 'approved', label: 'Approved', color: '#10b981' },
                                        { key: 'rejected', label: 'Rejected', color: '#ef4444' },
                                        { key: 'cancelled', label: 'Cancelled', color: '#6b7280' }
                                    ].map(tab => (
                                        <button
                                            key={tab.key}
                                            onClick={() => setFilterAppStatus(tab.key)}
                                            className={`filter-tab ${filterAppStatus === tab.key ? 'active' : ''}`}
                                            style={{ '--active-color': tab.color }}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="stats-overview">
                            {[
                                { status: 'approved', color: '#10b981', label: 'Approved' },
                                { status: 'pending', color: '#f59e0b', label: 'Pending' },
                                { status: 'rejected', color: '#ef4444', label: 'Rejected' },
                                { status: 'cancelled', color: '#6b7280', label: 'Cancelled' }
                            ].map(stat => (
                                <div key={stat.status} className="stat-item">
                                    <span className="stat-value" style={{ color: stat.color }}>
                                        {verificationApps.filter(app => app.status === stat.status).length}
                                    </span>
                                    <span className="stat-label">{stat.label}</span>
                                </div>
                            ))}
                        </div>

                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>App ID</th>
                                        <th>Applicant</th>
                                        <th>Status</th>
                                        <th>Submitted</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visibleApps.sort((a, b) => new Date(b.dateOfCreation) - new Date(a.dateOfCreation)).map((app) => {
                                        const user = users.find(u => u.id === app.userId);
                                        return (
                                            <tr key={app.id} onClick={() => nav(routes.verification_application, { state: { app, user } })}>
                                                <td className="id-cell">#{app.id}</td>
                                                <td className="name-cell">
                                                    {user ? (
                                                        <>
                                                            <div className="user-avatar">
                                                                {user.firstname?.charAt(0)}{user.lastname?.charAt(0)}
                                                            </div>
                                                            {user.firstname} {user.lastname}
                                                        </>
                                                    ) : (
                                                        <span className="unknown-user">Unknown User</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <span className={`status-badge status-${app.status}`}>
                                                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td>{new Date(app.dateOfCreation).toLocaleDateString()}</td>
                                                <td>
                                                    <button className="action-btn view-btn">
                                                        Review →
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeSection === "Admins" && (
                    <div className="section-card">
                        <div className="section-header">
                            <h2>🛡️ Admin Management</h2>
                            <div className="header-actions">
                                <div className="search-box">
                                    <input
                                        type="text"
                                        placeholder="Search admins..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="search-input"
                                    />
                                </div>
                                <button className="add-admin-btn" onClick={handleAddAdmin}>
                                    <span style={{ marginRight: '8px' }}>➕</span>
                                    New Admin
                                </button>
                            </div>
                        </div>

                        <div className="stats-overview">
                            <div className="stat-item">
                                <span className="stat-value">{admins.length}</span>
                                <span className="stat-label">Total Admins</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value" style={{ color: '#10b981' }}>
                                    {admins.filter(admin => admin.isActive).length}
                                </span>
                                <span className="stat-label">Active</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value" style={{ color: '#ef4444' }}>
                                    {admins.filter(admin => !admin.isActive).length}
                                </span>
                                <span className="stat-label">Inactive</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value" style={{ color: '#f59e0b' }}>
                                    {admins.filter(admin => admin.isSeed).length}
                                </span>
                                <span className="stat-label">Super Admins</span>
                            </div>
                        </div>

                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Admin ID</th>
                                        <th>Access ID</th>
                                        <th>Status</th>
                                        <th>Role</th>
                                        <th>Created</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {admins.map((admin) => (
                                        <Fragment key={admin.id}>
                                            <tr onClick={() => expandedAdmin === admin.id ? setExpandedAdmin(null) : setExpandedAdmin(admin.id)}>
                                                <td className="id-cell">{admin.id}</td>
                                                <td>
                                                    <div className="name-cell">
                                                        <div className="user-avatar" style={{ background: admin.isSeed ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #60a5fa, #3b82f6)' }}>
                                                            {admin.accessId?.charAt(0).toUpperCase()}
                                                        </div>
                                                        {admin.accessId}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${admin.isActive ? 'active' : 'terminated'}`}>
                                                        {admin.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${admin.isSeed ? 'status-pending' : 'status-approved'}`}>
                                                        {admin.isSeed ? 'Super Admin' : 'Admin'}
                                                    </span>
                                                </td>
                                                <td>{new Date(admin.dateOfCreation).toLocaleDateString()}</td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button
                                                            className="action-btn view-btn"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                expandedAdmin === admin.id ? setExpandedAdmin(null) : setExpandedAdmin(admin.id);
                                                            }}
                                                        >
                                                            {expandedAdmin === admin.id ? '▲ Details' : '▼ Details'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>

                                            {/* Expanded Row */}
                                            {expandedAdmin === admin.id && (
                                                <tr className="expanded-row">
                                                    <td colSpan="6" style={{ backgroundColor: 'rgba(59, 130, 246, 0.03)', padding: '0' }}>
                                                        <div style={{ padding: '24px' }}>
                                                            <div className="admin-details-expanded">
                                                                <h4 style={{ margin: '0 0 20px 0', color: '#60a5fa', fontSize: '16px' }}>
                                                                    Admin Details
                                                                </h4>

                                                                <div className="details-grid" style={{
                                                                    display: 'grid',
                                                                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                                                    gap: '16px',
                                                                    marginBottom: '24px'
                                                                }}>
                                                                    <div className="detail-item" style={{
                                                                        padding: '16px',
                                                                        background: 'rgba(255, 255, 255, 0.03)',
                                                                        borderRadius: '8px',
                                                                        borderLeft: '4px solid #60a5fa'
                                                                    }}>
                                                                        <strong style={{ color: '#60a5fa', display: 'block', marginBottom: '4px' }}>
                                                                            Access ID
                                                                        </strong>
                                                                        <span>{admin.accessId}</span>
                                                                    </div>

                                                                    <div className="detail-item" style={{
                                                                        padding: '16px',
                                                                        background: 'rgba(255, 255, 255, 0.03)',
                                                                        borderRadius: '8px',
                                                                        borderLeft: '4px solid #f59e0b'
                                                                    }}>
                                                                        <strong style={{ color: '#f59e0b', display: 'block', marginBottom: '4px' }}>
                                                                            Super Admin
                                                                        </strong>
                                                                        <span>{admin.isSeed ? 'Yes' : 'No'}</span>
                                                                    </div>

                                                                    <div className="detail-item" style={{
                                                                        padding: '16px',
                                                                        background: 'rgba(255, 255, 255, 0.03)',
                                                                        borderRadius: '8px',
                                                                        borderLeft: '4px solid #10b981'
                                                                    }}>
                                                                        <strong style={{ color: '#10b981', display: 'block', marginBottom: '4px' }}>
                                                                            Created
                                                                        </strong>
                                                                        <span>{new Date(admin.dateOfCreation).toLocaleString("en-US")}</span>
                                                                    </div>

                                                                    <div className="detail-item" style={{
                                                                        padding: '16px',
                                                                        background: 'rgba(255, 255, 255, 0.03)',
                                                                        borderRadius: '8px',
                                                                        borderLeft: '4px solid #8b5cf6'
                                                                    }}>
                                                                        <strong style={{ color: '#8b5cf6', display: 'block', marginBottom: '4px' }}>
                                                                            Permissions
                                                                        </strong>
                                                                        <span>{admin.permissions === 'read' ? "Read Only" : formatPermissions(admin.permissions)}</span>
                                                                    </div>
                                                                </div>

                                                                {/* Action Buttons - Only show for non-seed admins */}
                                                                {!admin.isSeed && (
                                                                    <div className="expanded-actions" style={{
                                                                        display: 'flex',
                                                                        gap: '12px',
                                                                        justifyContent: 'flex-end',
                                                                        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                                                                        paddingTop: '20px'
                                                                    }}>
                                                                        <button
                                                                            className="action-btn edit-admin-btn"
                                                                            onClick={() => handleEditAdmin(admin)}
                                                                            style={{
                                                                                background: 'rgba(59, 130, 246, 0.1)',
                                                                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                                                                color: '#3b82f6',
                                                                                padding: '10px 20px',
                                                                                borderRadius: '8px',
                                                                                cursor: 'pointer',
                                                                                fontSize: '14px',
                                                                                fontWeight: '500',
                                                                                transition: 'all 0.2s ease'
                                                                            }}
                                                                            onMouseEnter={(e) => {
                                                                                e.target.style.background = 'rgba(59, 130, 246, 0.2)';
                                                                                e.target.style.transform = 'translateY(-1px)';
                                                                            }}
                                                                            onMouseLeave={(e) => {
                                                                                e.target.style.background = 'rgba(59, 130, 246, 0.1)';
                                                                                e.target.style.transform = 'translateY(0)';
                                                                            }}
                                                                        >
                                                                            ✏️ Edit Admin
                                                                        </button>
                                                                        <button
                                                                            className={admin.isActive ? "action-btn terminate-admin-btn" : "action-btn restore-admin-btn"}
                                                                            onClick={() => handleTerminateAdmin(admin)}
                                                                            style={{
                                                                                background: admin.isActive
                                                                                    ? 'rgba(239, 68, 68, 0.1)'
                                                                                    : 'rgba(16, 185, 129, 0.1)',
                                                                                border: admin.isActive
                                                                                    ? '1px solid rgba(239, 68, 68, 0.3)'
                                                                                    : '1px solid rgba(16, 185, 129, 0.3)',
                                                                                color: admin.isActive ? '#ef4444' : '#10b981',
                                                                                padding: '10px 20px',
                                                                                borderRadius: '8px',
                                                                                cursor: 'pointer',
                                                                                fontSize: '14px',
                                                                                fontWeight: '500',
                                                                                transition: 'all 0.2s ease'
                                                                            }}
                                                                            onMouseEnter={(e) => {
                                                                                e.target.style.background = admin.isActive
                                                                                    ? 'rgba(239, 68, 68, 0.2)'
                                                                                    : 'rgba(16, 185, 129, 0.2)';
                                                                                e.target.style.transform = 'translateY(-1px)';
                                                                            }}
                                                                            onMouseLeave={(e) => {
                                                                                e.target.style.background = admin.isActive
                                                                                    ? 'rgba(239, 68, 68, 0.1)'
                                                                                    : 'rgba(16, 185, 129, 0.1)';
                                                                                e.target.style.transform = 'translateY(0)';
                                                                            }}
                                                                        >
                                                                            {admin.isActive ? '🚫 Terminate' : '✅ Restore'}
                                                                        </button>
                                                                    </div>
                                                                )}

                                                                {/* Message for seed admins */}
                                                                {admin.isSeed && (
                                                                    <div style={{
                                                                        textAlign: 'center',
                                                                        padding: '20px',
                                                                        background: 'rgba(245, 158, 11, 0.1)',
                                                                        borderRadius: '8px',
                                                                        border: '1px solid rgba(245, 158, 11, 0.3)',
                                                                        color: '#f59e0b'
                                                                    }}>
                                                                        <strong>🔒 Super Admin Account</strong>
                                                                        <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
                                                                            This is a system super admin account with full permissions.
                                                                            Some actions are restricted for security reasons.
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </main>
    </div>
);