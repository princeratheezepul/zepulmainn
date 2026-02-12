import React from 'react';
import '../styles/AboutTeam.css';

const AboutTeam = () => {
    const teamMembers = [
        {
            name: 'Srikanth Dhanwada',
            role: 'Founder & CEO',
            image: '/srikanth.png',
            linkedin: 'https://www.linkedin.com/in/srikanth-dhanwada-b9a94787'
        },
        {
            name: 'Tarun Ghulati',
            role: 'Co-Founder',
            image: '/tarun.png',
            linkedin: 'https://www.linkedin.com/in/tarunghulati'
        },
        {
            name: 'Syed Reena Sumera',
            role: 'CBO',
            image: '/reena.png',
            linkedin: 'https://www.linkedin.com/in/reena-sumera-93aa35a7'
        }
    ];

    return (
        <div className="about-team-container">
            <h2 className="team-title">Our Leadership Team</h2>
            <div className="team-grid">
                {teamMembers.map((member, index) => (
                    <div key={index} className="team-card">
                        <div className="team-image-container">
                            <img src={member.image} alt={member.name} className="team-image" />
                        </div>
                        <div className="team-info">
                            <h3
                                className="team-name"
                                onClick={() => window.open(member.linkedin, '_blank')}
                                style={{ cursor: 'pointer' }}
                            >
                                {member.name}
                            </h3>
                            <p className="team-role">{member.role}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AboutTeam;
