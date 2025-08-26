import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import './UserProfile.css';

const UserProfile = ({ userData }) => {
    if (!userData) {
        return null;
    }

    const { user, solvedProblems, totalProblems } = userData;

    const solvedCount = solvedProblems.length;
    const easySolved = solvedProblems.filter(p => p.problemId.difficulty === 'Easy').length;
    const mediumSolved = solvedProblems.filter(p => p.problemId.difficulty === 'Medium').length;
    const hardSolved = solvedProblems.filter(p => p.problemId.difficulty === 'Hard').length;
    const progressPercentage = totalProblems > 0 ? (solvedCount / totalProblems) * 100 : 0;

    return (
        <div className="user-profile-details">
            <div className="profile-header">
                {/* <img src={`https://i.pravatar.cc/150?u=${user.username}`} alt="User Avatar" className="profile-avatar" /> */}
                <div className="profile-info">
                    <h2>{user.username}</h2>
                    <p>{user.email}</p>
                </div>
            </div>

            <div className="profile-stats">
                <div className="progress-card">
                    <h3>Overall Progress</h3>
                    <div style={{ width: '150px', margin: '0 auto' }}>
                        <CircularProgressbar
                            value={progressPercentage}
                            text={`${solvedCount}/${totalProblems}`}
                            styles={buildStyles({
                                textColor: '#fff',
                                pathColor: `rgba(62, 152, 199, ${progressPercentage / 100})`,
                                trailColor: 'rgba(255, 255, 255, 0.2)',
                            })}
                        />
                    </div>
                </div>
                <div className="difficulty-stats">
                     <div className="stat-item easy">
                        <h4>Easy</h4>
                        <p>{easySolved}</p>
                    </div>
                    <div className="stat-item medium">
                        <h4>Medium</h4>
                        <p>{mediumSolved}</p>
                    </div>
                    <div className="stat-item hard">
                        <h4>Hard</h4>
                        <p>{hardSolved}</p>
                    </div>
                </div>
            </div>

            <div className="recent-activity">
                <h3>Recent Activity</h3>
                <ul>
                    {solvedProblems.slice(0, 5).map(activity => (
                        <li key={activity._id}>
                            Solved <a href={activity.problemId.problemLink} target="_blank" rel="noopener noreferrer">{activity.problemId.title}</a>
                            <span>{new Date(activity.solvedAt).toLocaleDateString()}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default UserProfile;
