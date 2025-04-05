// utils/api.js
export const getUserIdByUsername = async (username) => {
    try {
        const res = await fetch(`/api/users/profile/${username}`);
        
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Failed to fetch user data');
        }
        
        const userData = await res.json();
        
        // Response trực tiếp là user object (không có wrapper 'user')
        if (!userData || !userData._id) {
            throw new Error('User data is incomplete');
        }
        
        return userData._id;
    } catch (error) {
        console.error(`Failed to get user ID for ${username}:`, error);
        throw new Error(`Không tìm thấy người dùng ${username}`);
    }
};