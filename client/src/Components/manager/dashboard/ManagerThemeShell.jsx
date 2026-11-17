import React from 'react';
import { useLocation } from 'react-router-dom';
import { useControlCentreTheme, shellProps } from './controlCentreTheme';
import ManagerConsoleNav from './ManagerConsoleNav';
import './ControlCentreTheme.css';

/**
 * Applies the manager console theme to pages that live outside the dashboard
 * shell (job detail, candidate list, team, settings…). Those pages are shared
 * with the ProRecruiter console, which keeps its own light look.
 *
 * `nav`: show the console's top navigation, with this section highlighted
 * (pass true for a page that belongs to no section).
 */
const ManagerThemeShell = ({ children, nav = null }) => {
  const { pathname } = useLocation();
  const [, theme] = useControlCentreTheme();
  if (pathname.startsWith('/prorecruiter')) return children;
  return (
    <div {...shellProps(theme)}>
      {nav && <ManagerConsoleNav active={typeof nav === 'string' ? nav : null} />}
      {children}
    </div>
  );
};

export default ManagerThemeShell;
