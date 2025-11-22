/**
 * RollHistory Component
 *
 * Displays the history of dice rolls in the room, most recent first.
 */

interface DiceResult {
  roll_id: string;
  player_id: string;
  player_name: string;
  formula: string;
  individual_results: number[];
  modifier: number;
  total: number;
  timestamp: string;
}

interface RollHistoryProps {
  rolls: DiceResult[];
}

export default function RollHistory({
  rolls,
}: RollHistoryProps): JSX.Element {
  // Format timestamp to readable time (HH:MM:SS)
  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Sort rolls by timestamp descending (most recent first)
  const sortedRolls = [...rolls].sort(
    (a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Roll History</h2>

      {sortedRolls.length === 0 ? (
        <p className="text-gray-500 text-sm">No rolls yet</p>
      ) : (
        <ul className="space-y-3" role="list">
          {sortedRolls.map((roll) => (
            <li
              key={roll.roll_id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-800">
                    {roll.player_name}
                  </span>
                  <span className="text-gray-600 text-sm">
                    rolled {roll.formula}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>
                    Result: [{roll.individual_results.join(', ')}]
                    {roll.modifier !== 0 && (
                      <span>
                        {' '}
                        {roll.modifier > 0 ? '+' : ''}
                        {roll.modifier}
                      </span>
                    )}
                  </span>
                  <time
                    dateTime={roll.timestamp}
                    className="text-xs"
                    role="time"
                  >
                    {formatTime(roll.timestamp)}
                  </time>
                </div>
              </div>

              {/* Total result - prominently displayed */}
              <div className="ml-4 flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full text-lg font-bold">
                {roll.total}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
