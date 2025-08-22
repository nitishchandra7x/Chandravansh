import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, User, LogOut } from 'lucide-react';

type Section = 'dashboard' | 'mood' | 'habits' | 'fitness' | 'quiz' | 'game' | 'profile';

interface NavigationProps {
  currentSection: Section;
  onSectionChange: (section: Section) => void;
  userName: string;
}

export default function Navigation({ currentSection, onSectionChange, userName }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { id: 'dashboard' as Section, label: 'Dashboard' },
    { id: 'mood' as Section, label: 'Mood' },
    { id: 'habits' as Section, label: 'Habits' },
    { id: 'fitness' as Section, label: 'Fitness' },
    { id: 'quiz' as Section, label: 'Quiz' },
    { id: 'game' as Section, label: 'Game' },
  ];

  const handleSectionChange = (section: Section) => {
    onSectionChange(section);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg border-b-2 border-saffron">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold">
              <span className="text-saffron">Chandra</span>
              <span className="text-patriot">vansh</span>
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSectionChange(item.id)}
                className={`font-medium transition-colors ${
                  currentSection === item.id
                    ? 'text-saffron border-b-2 border-saffron'
                    : 'text-gray-700 hover:text-saffron'
                }`}
                data-testid={`nav-${item.id}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => handleSectionChange('profile')}
              variant="ghost"
              size="sm"
              className="hidden md:flex items-center space-x-2"
              data-testid="button-profile"
            >
              <User className="h-4 w-4" />
              <span>{userName}</span>
            </Button>
            
            <Button
              onClick={() => handleSectionChange('profile')}
              size="sm"
              className="md:hidden p-2 rounded-full bg-saffron text-white hover:bg-saffron-dark"
              data-testid="button-profile-mobile"
            >
              <User className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/api/logout'}
              className="hidden md:flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t animate-slide-up">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSectionChange(item.id)}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  currentSection === item.id
                    ? 'bg-orange-50 text-saffron'
                    : 'text-gray-700 hover:bg-orange-50 hover:text-saffron'
                }`}
                data-testid={`nav-mobile-${item.id}`}
              >
                {item.label}
              </button>
            ))}
            <hr className="my-2" />
            <button
              onClick={() => window.location.href = '/api/logout'}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              data-testid="button-logout-mobile"
            >
              <div className="flex items-center space-x-2">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </div>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
