import React, { useEffect } from 'react';

const ZepTicker = () => {

  useEffect(() => { const words = ['RaaS','AI Screening','CV Ranking','Talent Matching','AI Interviews','Skill Validation','Distributed Network','Coding Tests','Performance Analytics']; const track = document.getElementById('tk'); if(track) { track.innerHTML = [...words,...words].map(w=>`<span class="ti"><span class="ts">+</span>${w}</span>`).join(''); } }, []);
  return (
    <div id="ZepTicker-root" className="zep-recruit-page">
      <div className="ticker">
  <div className="ticker-track" id="tk"></div>
    </div>
    </div>
  );
};

export default ZepTicker;
