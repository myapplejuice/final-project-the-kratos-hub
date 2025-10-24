import React, { useState } from "react";
import { images } from "../utils/assets";
import { useLocation, useNavigate } from "react-router-dom";
import { usePopups } from "../utils/popups.provider";
import colors from "../utils/stylings";
import APIService from "../utils/api-service";
import { routes } from "../utils/constants";
import SessionStorageService from "../utils/session-storage-service";

export default function FoodProfile() {
    const admin = SessionStorageService.getItem("admin").admin;
    const { showDialog, showAlert, showSpinner, hideSpinner, showInput } = usePopups();
    const nav = useNavigate();
    const location = useLocation();
    const [food, setFood] = useState(location.state?.food);
    const [creator, setCreator] = useState(location.state?.creator);

    function handleRemoveFood() {
        showDialog({
            title: "Remove Food",
            content: (
                <div>
                    <p>Are you sure you want to remove this food from the database?</p>
                    <p style={{ color: '#ef4444', fontSize: '14px', margin: '10px 0 0 0' }}>
                        <strong>Warning:</strong> This action cannot be undone. User will lose access to this food item.
                    </p>
                </div>
            ),
            actions: [
                { label: "Cancel", color: "#6b7280", onClick: null },
                {
                    label: "Remove Food",
                    color: "#ef4444",
                    onClick: async () => {
                        try {
                            showSpinner();
                            const result = await APIService.routes.deleteFood({ foodId: food.id });

                            if (result.success) {
                                showAlert({
                                    title: "Food Removed",
                                    message: `${food.label} permanently removed from the database`
                                });
                                nav(-1);
                            } else {
                                showAlert({
                                    title: "Error",
                                    message: result.message || "Failed to remove food item"
                                });
                            }
                        } catch (error) {
                            console.error("Error removing food:", error);
                            showAlert({ title: "Error", message: "Failed to remove food item" });
                        } finally {
                            hideSpinner();
                        }
                    }
                }
            ],
        });
    }

    return (
        <main className="user-profile-main">
            <div className="user-profile-header">
                <div className="header-left">
                    <div className="back-button" onClick={() => nav(-1)}>
                        <img src={images.backArrow} className="back-arrow" />
                    </div>
                    <div className="user-info">
                        <div className="user-info-header">
                            <p className="user-name">{food.label}</p>
                        </div>
                        <p className="user-id">Food ID: {food.id}</p>
                    </div>
                </div>
                <img src={images.meals} style={{
                    width: 70,
                    height: 70,
                    filter: "invert(1)"
                }} />
            </div>
            
            <div className="profile-card" style={{ marginBottom: 30 }}>
                <div className="card-header">
                    <p className="card-title">Food Overview</p>
                </div>
                <div className="card-details">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <div className="card-detail-row" style={{ marginBottom: 5 }}>
                                <span className="card-detail-label">Food Name:</span>
                                <span className="card-detail-value">{food.label}</span>
                            </div>
                            <div className="card-detail-row" style={{ marginBottom: 5 }}>
                                <span className="card-detail-label">Category:</span>
                                <span
                                    className="card-detail-value"
                                    style={{
                                        color: 'white',
                                    }}
                                >
                                    {food.category}
                                </span>
                            </div>
                            <div className="card-detail-row" style={{ marginBottom: 5 }}>
                                <span className="card-detail-label">Serving Size:</span>
                                <span className="card-detail-value">
                                    {food.servingSize} {food.servingUnit}
                                </span>
                            </div>
                            <div className="card-detail-row" style={{ marginBottom: 5 }}>
                                <span className="card-detail-label">Food Type:</span>
                                <span className="card-detail-value">
                                    <span className="card-detail-value">
                                        {food.isUSDA ? 'USDA Database' : 'Custom Food'}
                                    </span>
                                </span>
                            </div>
                        </div>
                        <div>
                            <div className="card-detail-row" style={{ marginBottom: 5 }}>
                                <span className="card-detail-label">Visibility:</span>
                                <span className="card-detail-value">
                                    <span className="card-detail-value">
                                        {food.isPublic ? 'Public' : 'Private'}
                                    </span>
                                </span>
                            </div>
                            <div className="card-detail-row" style={{ marginBottom: 5 }}>
                                <span className="card-detail-label">Dominant Macro:</span>
                                <span
                                    className="card-detail-value"
                                    style={{
                                        color: 'white',
                                    }}
                                >
                                    {food.dominantMacro}
                                </span>
                            </div>
                            <div className="card-detail-row" style={{ marginBottom: 5 }}>
                                <span className="card-detail-label">Creator:</span>
                                <span className="card-detail-value">
                                    {creator ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {creator.firstname} {creator.lastname}
                                        </div>
                                    ) : (
                                        food.creatorName || 'Unknown'
                                    )}
                                </span>
                            </div>
                            {food.USDAId && food.USDAId !== -1 && (
                                <div className="card-detail-row">
                                    <span className="card-detail-label">USDA ID:</span>
                                    <span className="card-detail-value">{food.USDAId}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="profile-card" style={{ marginBottom: 30 }}>
                <div className="card-header">
                    <p className="card-title">Nutrition Information</p>
                    <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
                        Per {food.servingSize} {food.servingUnit}
                    </p>
                </div>
                <div className="card-details">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                        <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(175, 175, 175, 0.1)', borderRadius: '12px' }}>
                            <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', margin: '8px 0' }}>
                                {food.energyKcal}
                            </div>
                            <div style={{ color: '#94a3b8', fontSize: '14px' }}>Calories</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(175, 175, 175, 0.1)', borderRadius: '12px' }}>
                            <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', margin: '8px 0' }}>
                                {food.protein}g
                            </div>
                            <div style={{ color: '#94a3b8', fontSize: '14px' }}>Protein</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(175, 175, 175, 0.1)', borderRadius: '12px' }}>
                            <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', margin: '8px 0' }}>
                                {food.fat}g
                            </div>
                            <div style={{ color: '#94a3b8', fontSize: '14px' }}>Fat</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(175, 175, 175, 0.1)', borderRadius: '12px' }}>
                            <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', margin: '8px 0' }}>
                                {food.carbs}g
                            </div>
                            <div style={{ color: '#94a3b8', fontSize: '14px' }}>Carbs</div>
                        </div>
                    </div>
                </div>
            </div>

            {food.additionalProps && food.additionalProps.length > 0 && (
                <div className="profile-card" style={{ marginBottom: (admin.permissions.includes('foods') || admin.permissions.includes('all')) ? 30 : 300 }}>
                    <div className="card-header">
                        <p className="card-title">Additional Nutrients</p>
                    </div>
                    <div className="card-details">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                            {food.additionalProps.map((prop, index) => (
                                <div key={index} style={{
                                    padding: '15px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    borderRadius: '8px',
                                    borderLeft: '4px solid #5c92f6ff'
                                }}>
                                    <div style={{ fontWeight: '600', color: 'white', marginBottom: '4px' }}>
                                        {prop.label}
                                    </div>
                                    <div style={{ color: '#5c92f6ff', fontSize: '18px', fontWeight: 'bold' }}>
                                        {prop.amount} {prop.unit}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

             {(admin.permissions.includes('foods') || admin.permissions.includes('all')) &&
              <div className="profile-card" style={{ marginBottom: 300 }}>
                    <div className="card-header">
                        <p className="card-title">Admin Actions</p>
                    </div>

                            <button
                                onClick={handleRemoveFood}
                                style={{
                                    padding: '8px 16px',
                                    background: 'rgba(239, 68, 68, 0.2)',
                                    color: '#ef4444',
                                    border: '1px solid rgba(239, 68, 68, 0.4)',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseOver={(e) => {
                                    e.target.style.background = 'rgba(239, 68, 68, 0.3)';
                                    e.target.style.transform = 'translateY(-1px)';
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.background = 'rgba(239, 68, 68, 0.2)';
                                    e.target.style.transform = 'translateY(0)';
                                }}
                            >
                                Remove Food
                            </button>
                            <p style={{ marginTop: '8px', color: '#ef4444', fontSize: '12px' }}>Removing food permanently removes the record from the database</p>
                        </div>
                    }
        </main>
    );
}