import React from 'react';

const LyricsDisplay = ({ lyrics }) => {
    return (
        <div className="lyrics-display">
            <h2>Lyrics</h2>
            <ul>
                {lyrics.map((line, index) => (
                    <li key={index}>
                        <span>{line.start_time}s: </span>
                        {line.line}
                    </li>
                ))}
            </ul>
        </div>
    );
};
 
export default LyricsDisplay;