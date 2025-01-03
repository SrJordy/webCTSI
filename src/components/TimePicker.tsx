import React, { useState } from 'react';

interface TimePickerProps {
    value: string;
    onChange: (time: string) => void;
}

const TimePicker: React.FC<TimePickerProps> = ({ value, onChange }) => {
    const [selectedHour, setSelectedHour] = useState(12);
    const [selectedMinute, setSelectedMinute] = useState(0);
    const [isHourView, setIsHourView] = useState(true);
    const [isOpen, setIsOpen] = useState(false);

    const hours = Array.from({ length: 12 }, (_, i) => i + 1);
    const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

    const getPosition = (index: number, total: number, radius: number) => {
        const angle = ((index * 360) / total - 90) * (Math.PI / 180);
        return {
            x: radius * Math.cos(angle),
            y: radius * Math.sin(angle)
        };
    };

    const handleTimeSelect = (hour: number, minute: number) => {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        onChange(timeString);
    };

    const handleHourSelect = (hour: number) => {
        setSelectedHour(hour);
        handleTimeSelect(hour, selectedMinute);
        setIsHourView(false);
    };

    const handleMinuteSelect = (minute: number) => {
        setSelectedMinute(minute);
        handleTimeSelect(selectedHour, minute);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent text-left"
            >
                {value || 'Seleccionar hora'}
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-2 bg-white rounded-lg shadow-xl p-4">
                    <div className="w-64 h-64 relative bg-white rounded-full shadow-lg">
                        {/* Centro del reloj */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-red-400 rounded-full" />

                        {/* Números */}
                        {isHourView ? 
                            hours.map((hour) => {
                                const pos = getPosition(hour, 12, 90);
                                return (
                                    <button
                                        key={hour}
                                        type="button"
                                        onClick={() => handleHourSelect(hour)}
                                        className={`absolute w-8 h-8 -ml-4 -mt-4 flex items-center justify-center rounded-full
                                            ${selectedHour === hour ? 'bg-red-400 text-white' : 'hover:bg-red-100'}`}
                                        style={{
                                            left: `${pos.x + 128}px`,
                                            top: `${pos.y + 128}px`
                                        }}
                                    >
                                        {hour}
                                    </button>
                                );
                            })
                            :
                            minutes.map((minute, index) => {
                                const pos = getPosition(index, 12, 90);
                                return (
                                    <button
                                        key={minute}
                                        type="button"
                                        onClick={() => handleMinuteSelect(minute)}
                                        className={`absolute w-8 h-8 -ml-4 -mt-4 flex items-center justify-center rounded-full
                                            ${selectedMinute === minute ? 'bg-red-400 text-white' : 'hover:bg-red-100'}`}
                                        style={{
                                            left: `${pos.x + 128}px`,
                                            top: `${pos.y + 128}px`
                                        }}
                                    >
                                        {minute.toString().padStart(2, '0')}
                                    </button>
                                );
                            })
                        }

                        {/* Manecilla */}
                        <div
                            className="absolute top-1/2 left-1/2 origin-center w-1 bg-red-400 rounded-full"
                            style={{
                                height: '80px',
                                transform: `rotate(${isHourView ? 
                                    ((selectedHour % 12) * 30 - 90) : 
                                    (selectedMinute * 6 - 90)}deg)`,
                                transformOrigin: '0 0'
                            }}
                        />
                    </div>

                    {/* Visualización de la hora seleccionada */}
                    <div className="mt-4 text-center">
                        <button
                            type="button"
                            onClick={() => setIsHourView(!isHourView)}
                            className="px-4 py-2 bg-red-400 text-white rounded-lg"
                        >
                            {`${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimePicker;