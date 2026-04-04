import { useState, useCallback } from 'react';
import { useNanoStore } from '~/lib/hooks/useNanoStore';
import { classNames } from '~/utils/classNames';
import { profileStore, updateProfile } from '~/lib/stores/profile';
import { toast } from 'react-toastify';
import { debounce } from '~/utils/debounce';
import { Icon } from '~/components/ui/Icon';

export default function ProfileTab() {
  const profile = useNanoStore(profileStore);
  const [isUploading, setIsUploading] = useState(false);

  // Create debounced update functions
  const debouncedUpdate = useCallback(
    debounce((field: 'username' | 'bio', value: string) => {
      updateProfile({ [field]: value });
      toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated`);
    }, 1000),
    [],
  );

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setIsUploading(true);

      // Convert the file to base64
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64String = reader.result as string;
        updateProfile({ avatar: base64String });
        setIsUploading(false);
        toast.success('Profile picture updated');
      };

      reader.onerror = () => {
        console.error('Error reading file:', reader.error);
        setIsUploading(false);
        toast.error('Failed to update profile picture');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setIsUploading(false);
      toast.error('Failed to update profile picture');
    }
  };

  const handleProfileUpdate = (field: 'username' | 'bio', value: string) => {
    // Update the store immediately for UI responsiveness
    updateProfile({ [field]: value });

    // Debounce the toast notification
    debouncedUpdate(field, value);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="space-y-6">
        {/* Personal Information Section */}
        <div>
          {/* Avatar Upload */}
          <div className="flex items-start gap-6 mb-8">
            <div
              className={classNames(
                'w-24 h-24 rounded-full overflow-hidden',
                'bg-bolt-elements-background-depth-2',
                'flex items-center justify-center',
                'ring-1 ring-bolt-elements-borderColor',
                'relative group',
                'transition-all duration-300 ease-out',
                'hover:ring-bolt-elements-borderColorActive',
                'hover:shadow-lg hover:shadow-bolt-elements-item-backgroundAccent/10',
              )}
            >
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt="Profile"
                  className={classNames(
                    'w-full h-full object-cover',
                    'transition-all duration-300 ease-out',
                    'group-hover:scale-105 group-hover:brightness-90',
                  )}
                />
              ) : (
                <Icon name="bot" size={64} className="text-gray-400 dark:text-gray-500 transition-colors group-hover:text-gray-500/70 transform -translate-y-1" />
              )}

              <label
                className={classNames(
                  'absolute inset-0',
                  'flex items-center justify-center',
                  'bg-black/0 group-hover:bg-black/40',
                  'cursor-pointer transition-all duration-300 ease-out',
                  isUploading ? 'cursor-wait' : '',
                )}
              >
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={isUploading}
                />
                {isUploading ? (
                  <Icon name="loader-2" size={24} className="text-white animate-spin" />
                ) : (
                  <Icon name="camera" size={24} className="text-white opacity-100 group-hover:opacity-100 transition-all duration-300 ease-out transform group-hover:scale-110" />
                )}
              </label>
            </div>

            <div className="flex-1 pt-1">
              <label className="block text-base font-medium text-gray-900 dark:text-gray-100 mb-1">
                Profile Picture
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Upload a profile picture or avatar</p>
            </div>
          </div>

          {/* Username Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-bolt-elements-textPrimary mb-2">Username</label>
            <div className="relative group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                <Icon
                  name="user-circle"
                  size={20}
                  className="text-bolt-elements-textTertiary transition-colors group-focus-within:text-bolt-elements-item-contentAccent"
                />
              </div>
              <input
                type="text"
                value={profile.username}
                onChange={(e) => handleProfileUpdate('username', e.target.value)}
                className={classNames(
                  'w-full pl-11 pr-4 py-2.5 rounded-xl',
                  'bg-bolt-elements-background-depth-2',
                  'border border-bolt-elements-borderColor',
                  'text-bolt-elements-textPrimary',
                  'placeholder-bolt-elements-textTertiary',
                  'focus:outline-none focus:ring-2 focus:ring-bolt-elements-item-backgroundAccent/50 focus:border-bolt-elements-borderColorActive',
                  'transition-all duration-300 ease-out',
                )}
                placeholder="Enter your username"
              />
            </div>
          </div>

          {/* Bio Input */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-bolt-elements-textPrimary mb-2">Bio</label>
            <div className="relative group">
              <div className="absolute left-3.5 top-3">
                <Icon
                  name="type"
                  size={20}
                  className="text-bolt-elements-textTertiary transition-colors group-focus-within:text-bolt-elements-item-contentAccent"
                />
              </div>
              <textarea
                value={profile.bio}
                onChange={(e) => handleProfileUpdate('bio', e.target.value)}
                className={classNames(
                  'w-full pl-11 pr-4 py-2.5 rounded-xl',
                  'bg-bolt-elements-background-depth-2',
                  'border border-bolt-elements-borderColor',
                  'text-bolt-elements-textPrimary',
                  'placeholder-bolt-elements-textTertiary',
                  'focus:outline-none focus:ring-2 focus:ring-bolt-elements-item-backgroundAccent/50 focus:border-bolt-elements-borderColorActive',
                  'transition-all duration-300 ease-out',
                  'resize-none',
                  'h-32',
                )}
                placeholder="Tell us about yourself"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
