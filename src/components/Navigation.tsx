import { NavLink } from 'react-router-dom';
import { LogoutButton } from './LogoutButton';

export function Navigation() {
  const navLinks = [
    { path: '/mesero', label: 'Mesero', icon: 'restaurant_menu', testId: 'nav-mesero' },
    { path: '/barra', label: 'Barra', icon: 'local_bar', testId: 'nav-barra' },
    { path: '/cocina-caliente', label: 'Cocina Caliente', icon: 'local_fire_department', testId: 'nav-cocina-caliente' },
    { path: '/cocina-fria', label: 'Cocina Fría', icon: 'ac_unit', testId: 'nav-cocina-fria' },
    { path: '/admin', label: 'Admin', icon: 'admin_panel_settings', testId: 'nav-admin' },
    { path: '/admin/carga-masiva', label: 'Carga Masiva', icon: 'upload_file', testId: 'nav-bulk-upload' }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-charcoal border-b border-white/10 z-50">
      <div className="h-full px-8 flex items-center justify-between">
        {}
        <div className="flex items-center gap-3">
          <div className="size-10 gold-gradient rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-midnight text-2xl font-bold">restaurant</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white-text">FoodTech</h1>
            <p className="text-[10px] text-primary uppercase tracking-wider">Kitchen System</p>
          </div>
        </div>

        {}
        <div className="flex items-center gap-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              data-testid={link.testId}
              className={({ isActive }: { isActive: boolean }) =>
                `px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                  isActive
                    ? 'gold-gradient text-midnight shadow-lg shadow-primary/20'
                    : 'text-silver-text hover:text-white-text hover:bg-white/5'
                }`
              }
            >
              <span className="material-symbols-outlined text-lg">{link.icon}</span>
              <span className="hidden md:inline">{link.label}</span>
            </NavLink>
          ))}

          {}
          <LogoutButton />
        </div>
      </div>
    </nav>
  );
}
