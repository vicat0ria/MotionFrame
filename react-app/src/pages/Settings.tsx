import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Lock, Bell, Settings as SettingsIcon, LogOut } from 'lucide-react';
import logo from "@/assets/MF-logo.png";
import './Settings.css';

type SettingsTab = 'account' | 'password' | 'notifications' | 'preferences';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  // Demo user state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('user@email.com');
  const [editingEmail, setEditingEmail] = useState(false);
  const [tempEmail, setTempEmail] = useState(email);

  const handleEmailEdit = () => {
    setTempEmail(email);
    setEditingEmail(true);
  };
  const handleEmailCancel = () => {
    setTempEmail(email);
    setEditingEmail(false);
  };
  const handleSaveChanges = () => {
    setEmail(tempEmail);
    setEditingEmail(false);
    // Add logic to save other fields if needed
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'account':
        return (
          <div className="space-y-6 text-left p-8 rounded-xl mt-2 border border-white/10 shadow-lg" style={{ backgroundColor: '#20192d' }}>
            <h2 className="text-2xl font-bold text-white mb-6 text-left">Account</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-white/70 mb-2">First Name</label>
                <Input
                  type="text"
                  placeholder="Enter your first name"
                  className="bg-background w-full"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-white/70 mb-2">Last Name</label>
                <Input
                  type="text"
                  placeholder="Enter your last name"
                  className="bg-background w-full"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-white/70 mb-2">Email Address</label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="email"
                    className="bg-background w-full"
                    value={editingEmail ? tempEmail : email}
                    onChange={e => setTempEmail(e.target.value)}
                    disabled={!editingEmail}
                  />
                  {!editingEmail ? (
                    <Button type="button" variant="outline" className="h-10 px-4" onClick={handleEmailEdit}>
                      Edit
                    </Button>
                  ) : (
                    <Button type="button" variant="outline" className="h-10 px-4" onClick={handleEmailCancel}>
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
              <Button onClick={handleSaveChanges} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-semibold rounded-lg py-3 mt-6">
                Save Changes
              </Button>
            </div>
          </div>
        );
      case 'password':
        return (
          <div className="space-y-6 text-left p-8 rounded-xl mt-2 border border-white/10 shadow-lg" style={{ backgroundColor: '#20192d' }}>
            <h2 className="text-2xl font-bold text-white mb-6 text-left">Password</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-white/70 mb-2">Current Password</label>
                <Input
                  type="password"
                  placeholder="Enter current password"
                  className="bg-background w-full"
                />
              </div>
              <div>
                <label className="block text-white/70 mb-2">New Password</label>
                <Input
                  type="password"
                  placeholder="Enter new password"
                  className="bg-background w-full"
                />
              </div>
              <div>
                <label className="block text-white/70 mb-2">Confirm New Password</label>
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  className="bg-background w-full"
                />
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-semibold rounded-lg py-3 mt-6">
                Update Password
              </Button>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-6 text-left p-8 rounded-xl mt-2 border border-white/10 shadow-lg" style={{ backgroundColor: '#20192d' }}>
            <h2 className="text-2xl font-bold text-white mb-6 text-left">Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Checkbox className="bg-background" />
                <label className="font-bold text-white/70">Receive updates about projects</label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox className="bg-background" />
                <label className="font-bold text-white/70">Receive new feature announcements</label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox className="bg-background" />
                <label className="font-bold text-white/70">Receive promotions and tips</label>
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-semibold rounded-lg py-3 mt-6">
                Save Preferences
              </Button>
            </div>
          </div>
        );
      case 'preferences':
        return (
          <div className="space-y-6 text-left p-8 rounded-xl mt-2 border border-white/10 shadow-lg" style={{ backgroundColor: '#20192d' }}>
            <h2 className="text-2xl font-bold text-white mb-6 text-left">Preferences</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-white/70 mb-2">Theme</label>
                <select className="w-full px-4 py-2 rounded-lg bg-background border border-input text-white focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </div>
              <div>
                <label className="block text-white/70 mb-2">Language</label>
                <select className="w-full px-4 py-2 rounded-lg bg-background border border-input text-white focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </select>
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-semibold rounded-lg py-3 mt-6">
                Save Preferences
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#2c223e' }}>
      {/* Sidebar */}
      <aside
        className="w-64 flex flex-col items-center py-8 px-4 border-r border-[#3a3a3a]"
        style={{ backgroundColor: '#20192d' }}
      >
        <div className="flex items-center gap-2 mb-10">
          <div className="bg-white/5 pl-3 pr-1 py-3 rounded-xl backdrop-blur-sm">
            <img src={logo} alt="MotionFrame Logo" className="h-10 w-auto filter invert opacity-90" />
          </div>
          <span className="text-2xl font-bold text-white/90 tracking-tight">MotionFrame</span>
        </div>
        
        <nav className="w-full space-y-2">
          <button
            onClick={() => setActiveTab('account')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'account' ? 'bg-white/10' : 'hover:bg-white/5'
            }`}
          >
            <User className="text-white" size={20} />
            <span className="text-white">Account</span>
          </button>
          
          <button
            onClick={() => setActiveTab('password')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'password' ? 'bg-white/10' : 'hover:bg-white/5'
            }`}
          >
            <Lock className="text-white" size={20} />
            <span className="text-white">Password</span>
          </button>
          
          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'notifications' ? 'bg-white/10' : 'hover:bg-white/5'
            }`}
          >
            <Bell className="text-white" size={20} />
            <span className="text-white">Notifications</span>
          </button>
          
          <button
            onClick={() => setActiveTab('preferences')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'preferences' ? 'bg-white/10' : 'hover:bg-white/5'
            }`}
          >
            <SettingsIcon className="text-white" size={20} />
            <span className="text-white">Preferences</span>
          </button>
          
          <div className="border-t border-white/10 my-4" />
          
          <button
            onClick={() => console.log('Log out clicked')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-white/5"
          >
            <LogOut className="text-white" size={20} />
            <span className="text-white">Log Out</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">
        <h1 className="text-4xl font-bold text-white/90 tracking-tight mb-8">Profile Settings</h1>
        <div className="rounded-xl p-0 shadow-none max-w-3xl ml-0">
          {renderContent()}
        </div>
      </main>
    </div>
  );
} 