// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Finde nur den MainProcessTime Wert
      const mainProcessData = payload.find((entry: any) => entry.dataKey === 'perfTimeValue');
      
      if (mainProcessData) {
        return (
          <div className="bg-slate-800 border border-slate-600 rounded-md p-2 shadow-lg">
            <p className="text-slate-200 text-sm mb-1">
              {`Time: ${new Date(label).toLocaleTimeString()}`}
            </p>
            <p className="text-slate-300 text-sm">
              {`Main Process Time: ${Math.round(mainProcessData.value)} ms`}
            </p>
          </div>
        );
      }
    }
    return null;
};

export default CustomTooltip;