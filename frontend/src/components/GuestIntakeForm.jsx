"use client";

import { useState } from 'react';
import { registerGuest } from '../services/api';

export default function GuestIntakeForm() {
    const context = '[GuestIntakeForm Component]';

    // Step 1: Initialize React State (Our local ledger before submission)
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        idNumber: '',
        idDocumentUrl: '',
        dietaryRestrictions: ''
    });

    // UI Feedback State
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');

    // Handle keystrokes and update our state
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle the submission pipeline
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(`${context} Step 1: Form submission triggered by user.`);
        setStatus('loading');
        setMessage('');

        // Step 2: Frontend Validation (Failure Point N)
        if (!formData.fullName || !formData.email || !formData.idNumber || !formData.idDocumentUrl) {
            console.warn(`${context} Failure Point N: Frontend validation failed. Missing required fields.`);
            setStatus('error');
            setMessage('Please fill out all required fields (Name, Email, ID Number, ID URL).');
            return;
        }

        try {
            console.log(`${context} Step 3: Validation passed. Handing off to API Service Layer.`);
            const result = await registerGuest(formData);
            
            console.log(`${context} Step 4: UI received success confirmation. Guest State is initialized at 1.`);
            setStatus('success');
            setMessage(`Registration successful! Your Guest ID is: ${result.guestId}`);
            
            // Clear the form after success
            setFormData({
                fullName: '', email: '', phone: '', idNumber: '', idDocumentUrl: '', dietaryRestrictions: ''
            });

        } catch (error) {
            console.error(`${context} CRITICAL FAILURE: Caught error from API service.`, error.message);
            setStatus('error');
            setMessage(error.message || 'An error occurred during registration. Please try again.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {/* Success or Error Messages */}
            {status === 'error' && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm">
                    {message}
                </div>
            )}
            {status === 'success' && (
                <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded-md text-sm">
                    {message}
                </div>
            )}

            {/* Form Fields */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900" 
                    placeholder="John Doe" disabled={status === 'loading'} />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900" 
                    placeholder="john@example.com" disabled={status === 'loading'} />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900" 
                    placeholder="+1 234 567 8900" disabled={status === 'loading'} />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID Number (Passport/Gov ID) *</label>
                <input type="text" name="idNumber" value={formData.idNumber} onChange={handleChange} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900" 
                    placeholder="ABC123456" disabled={status === 'loading'} />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID Document URL (Link to image) *</label>
                <input type="text" name="idDocumentUrl" value={formData.idDocumentUrl} onChange={handleChange} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900" 
                    placeholder="https://storage.provider.com/my-id.jpg" disabled={status === 'loading'} />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dietary Restrictions</label>
                <input type="text" name="dietaryRestrictions" value={formData.dietaryRestrictions} onChange={handleChange} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900" 
                    placeholder="Vegan, Nut Allergy, etc." disabled={status === 'loading'} />
            </div>

            <button type="submit" disabled={status === 'loading'} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 disabled:opacity-50 mt-4">
                {status === 'loading' ? 'Processing...' : 'Register as Guest'}
            </button>
        </form>
    );
}