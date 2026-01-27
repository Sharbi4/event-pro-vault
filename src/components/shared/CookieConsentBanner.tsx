import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, Settings, X, Check, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useCookieConsent, CookieCategory } from '@/hooks/useCookieConsent';
import { Link } from 'react-router-dom';

export function CookieConsentBanner() {
  const {
    preferences,
    showBanner,
    acceptAll,
    rejectNonEssential,
    updatePreference,
    savePreferences,
  } = useCookieConsent();
  
  const [showSettings, setShowSettings] = useState(false);
  const [tempPreferences, setTempPreferences] = useState(preferences);

  if (!showBanner) return null;

  const handleSavePreferences = () => {
    savePreferences(tempPreferences);
    setShowSettings(false);
  };

  const handleTempUpdate = (category: CookieCategory, enabled: boolean) => {
    if (category === 'necessary') return;
    setTempPreferences(prev => ({ ...prev, [category]: enabled }));
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6"
      >
        <div className="container mx-auto max-w-4xl">
          <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            {/* Main Banner */}
            <AnimatePresence mode="wait">
              {!showSettings ? (
                <motion.div
                  key="banner"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-4 md:p-6"
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="flex-shrink-0 p-3 bg-primary/10 rounded-xl">
                      <Cookie className="w-6 h-6 text-primary" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">We value your privacy</h3>
                      <p className="text-sm text-muted-foreground">
                        We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. 
                        Read our{' '}
                        <Link to="/privacy" className="text-primary hover:underline">
                          Privacy Policy
                        </Link>{' '}
                        to learn more.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setTempPreferences(preferences);
                          setShowSettings(true);
                        }}
                        className="gap-2"
                      >
                        <Settings className="w-4 h-4" />
                        Customize
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={rejectNonEssential}
                      >
                        Reject All
                      </Button>
                      <Button
                        size="sm"
                        onClick={acceptAll}
                        className="gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Accept All
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-4 md:p-6"
                >
                  {/* Settings Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Shield className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-semibold text-foreground">Cookie Preferences</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowSettings(false)}
                      className="h-8 w-8"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Cookie Categories */}
                  <div className="space-y-4 mb-6">
                    {/* Necessary */}
                    <div className="flex items-start justify-between gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-foreground text-sm">Strictly Necessary</h4>
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Required</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Essential for the website to function properly. These cannot be disabled.
                        </p>
                      </div>
                      <Switch checked disabled className="opacity-50" />
                    </div>

                    {/* Analytics */}
                    <div className="flex items-start justify-between gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground text-sm mb-1">Analytics</h4>
                        <p className="text-xs text-muted-foreground">
                          Help us understand how visitors interact with our website to improve user experience.
                        </p>
                      </div>
                      <Switch
                        checked={tempPreferences.analytics}
                        onCheckedChange={(checked) => handleTempUpdate('analytics', checked)}
                      />
                    </div>

                    {/* Marketing */}
                    <div className="flex items-start justify-between gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground text-sm mb-1">Marketing</h4>
                        <p className="text-xs text-muted-foreground">
                          Used to deliver personalized advertisements and measure their effectiveness.
                        </p>
                      </div>
                      <Switch
                        checked={tempPreferences.marketing}
                        onCheckedChange={(checked) => handleTempUpdate('marketing', checked)}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSettings(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSavePreferences}
                      className="gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Save Preferences
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
