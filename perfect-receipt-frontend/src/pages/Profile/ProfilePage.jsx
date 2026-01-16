import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    Loader2,
    User,
    Mail,
    Building,
    Phone,
    MapPin,
    Upload,
    Edit2,
    X,
    Check
} from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';

const ProfilePage = () => {
    const { user, loading: authLoading, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    
    // Profile picture states
    const [profilePicturePreview, setProfilePicturePreview] = useState(null);
    const [profilePictureFile, setProfilePictureFile] = useState(null);
    const [uploadingProfile, setUploadingProfile] = useState(false);
    
    // Business logo states
    const [businessLogoPreview, setBusinessLogoPreview] = useState(null);
    const [businessLogoFile, setBusinessLogoFile] = useState(null);
    const [uploadingLogo, setUploadingLogo] = useState(false);

    const [profileData, setProfileData] = useState({
        name: '',
        businessName: '',
        phone: '',
        address: '',
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                businessName: user.businessName || '',
                phone: user.phone || '',
                address: user.address || '',
            });
            setProfilePicturePreview(user.profilePicture || null);
            setBusinessLogoPreview(user.businessLogo || null);
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleProfilePictureChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePictureFile(file);
            setProfilePicturePreview(URL.createObjectURL(file));
        }
    };

    const handleBusinessLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBusinessLogoFile(file);
            setBusinessLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleProfilePictureUpload = async () => {
        if (!profilePictureFile) return;

        setUploadingProfile(true);
        const formData = new FormData();
        formData.append('profilePicture', profilePictureFile);

        try {
            const response = await axiosInstance.post(
                API_PATHS.AUTH.UPLOAD_PROFILE_PICTURE,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            updateUser({ ...user, profilePicture: response.data.profilePicture });
            setProfilePictureFile(null);
            toast.success('Profile picture uploaded successfully');
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Profile picture upload failed');
            console.error(error);
        } finally {
            setUploadingProfile(false);
        }
    };

    const handleBusinessLogoUpload = async () => {
        if (!businessLogoFile) return;

        setUploadingLogo(true);
        const formData = new FormData();
        formData.append('businessLogo', businessLogoFile);

        try {
            const response = await axiosInstance.post(
                API_PATHS.AUTH.UPLOAD_BUSINESS_LOGO,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            updateUser({ ...user, businessLogo: response.data.businessLogo });
            setBusinessLogoFile(null);
            toast.success('Business logo uploaded successfully');
        } catch (error) {
            toast.error('Business logo upload failed');
            console.error(error);
        } finally {
            setUploadingLogo(false);
        }
    };

    const handleUpdateProfile = async () => {
        setIsUpdating(true);
        try {
            const response = await axiosInstance.put(API_PATHS.AUTH.UPDATE_PROFILE, profileData);
            updateUser(response.data);
            setIsEditing(false);
            toast.success('Profile updated successfully');
        } catch (error) {
            console.error('Profile update failed:', error);
            toast.error('Failed to update profile');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCancel = () => {
        setProfileData({
            name: user.name || '',
            businessName: user.businessName || '',
            phone: user.phone || '',
            address: user.address || ''
        });
        setIsEditing(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
                    <p className="text-sm text-slate-600 mt-1">
                        Manage your personal and business information
                    </p>
                </div>
                {!isEditing ? (
                    <Button variant="secondary" onClick={() => setIsEditing(true)} icon={Edit2}>
                        Edit Profile
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={handleCancel} icon={X}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleUpdateProfile}
                            isLoading={isUpdating}
                            icon={Check}
                        >
                            Save Changes
                        </Button>
                    </div>
                )}
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                {/* Profile Picture Section */}
                <div className="relative h-32 bg-linear-to-r from-orange-600 to-purple-600">
                    <div className="absolute -bottom-16 left-8">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full border-4 border-white bg-slate-100 overflow-hidden">
                                {profilePicturePreview ? (
                                    <img
                                        src={profilePicturePreview}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-200">
                                        <User className="w-16 h-16 text-slate-400" />
                                    </div>
                                )}
                            </div>
                            {isEditing && (
                                <label
                                    htmlFor="profile-picture-upload"
                                    className="absolute bottom-0 right-0 w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-orange-700 transition"
                                >
                                    <Upload className="w-5 h-5 text-white" />
                                    <input
                                        type="file"
                                        id="profile-picture-upload"
                                        accept="image/*"
                                        onChange={handleProfilePictureChange}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>
                        {profilePictureFile && (
                            <Button
                                size="small"
                                otherClasses="mt-2"
                                onClick={handleProfilePictureUpload}
                                isLoading={uploadingProfile}
                            >
                                Upload
                            </Button>
                        )}
                    </div>
                </div>

                {/* Profile Info */}
                <div className="pt-20 px-8 pb-8">
                    <div className="space-y-6">
                        {/* Personal Information */}
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">
                                Personal Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        <User className="w-4 h-4 inline mr-2" />
                                        Full Name
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="name"
                                            value={profileData.name}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        />
                                    ) : (
                                        <p className="text-slate-900 font-medium">{user?.name || 'N/A'}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        <Mail className="w-4 h-4 inline mr-2" />
                                        Email Address
                                    </label>
                                    <p className="text-slate-500 text-sm bg-slate-50 px-4 py-2 rounded-lg">
                                        {user?.email || 'N/A'}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Email cannot be changed
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Business Information */}
                        <div className="pt-6 border-t border-slate-200">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">
                                Business Information
                            </h3>

                            {/* Business Logo */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-700 mb-3">
                                    Business Logo
                                </label>
                                <div className="flex items-center gap-6">
                                    <div className="w-24 h-24 border-2 border-slate-200 rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center">
                                        {businessLogoPreview ? (
                                            <img
                                                src={businessLogoPreview}
                                                alt="Business Logo"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Building className="w-10 h-10 text-slate-400" />
                                        )}
                                    </div>

                                    {isEditing && (
                                        <div>
                                            <input
                                                type="file"
                                                id="business-logo-upload"
                                                accept="image/*"
                                                onChange={handleBusinessLogoChange}
                                                className="hidden"
                                            />
                                            <label
                                                htmlFor="business-logo-upload"
                                                className="cursor-pointer inline-flex items-center px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50"
                                            >
                                                <Upload className="w-4 h-4 mr-2" />
                                                Choose Logo
                                            </label>

                                            {businessLogoFile && (
                                                <button
                                                    onClick={handleBusinessLogoUpload}
                                                    disabled={uploadingLogo}
                                                    className="ml-3 px-4 py-2 bg-orange-900 text-white rounded-lg text-sm font-medium hover:bg-orange-800 disabled:opacity-50"
                                                >
                                                    {uploadingLogo ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                                                            Uploading...
                                                        </>
                                                    ) : (
                                                        'Upload'
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        <Building className="w-4 h-4 inline mr-2" />
                                        Business Name
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="businessName"
                                            value={profileData.businessName}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        />
                                    ) : (
                                        <p className="text-slate-900 font-medium">
                                            {user?.businessName || 'Not set'}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        <Phone className="w-4 h-4 inline mr-2" />
                                        Phone Number
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={profileData.phone}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        />
                                    ) : (
                                        <p className="text-slate-900 font-medium">
                                            {user?.phone || 'Not set'}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    <MapPin className="w-4 h-4 inline mr-2" />
                                    Business Address
                                </label>
                                {isEditing ? (
                                    <textarea
                                        name="address"
                                        value={profileData.address}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                ) : (
                                    <p className="text-slate-900">{user?.address || 'Not set'}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;