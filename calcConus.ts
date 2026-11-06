interface ConeInputParams {
    /** Начальный диаметр конуса на входе (D_min) */
    initialDiameter: number;
    /** Полный угол расширения конуса в градусах (угол при вершине) */
    totalAngleDegrees: number;
    /** Отношение площади выхода к площади входа (S_max / S_min) */
    areaRatio: number;
}

interface ConeOutputResult {
    /** Высота (длина) конуса вдоль его центральной оси */
    height: number;
    /** Конечный диаметр конуса на выходе */
    finalDiameter: number;
}

/**
 * Рассчитывает геометрические параметры конуса на основе отношения площадей
 * @param params Входные параметры: начальный диаметр, полный угол и отношение площадей
 * @returns Объект с длиной (высотой) конуса и его конечным диаметром
 */
function calculateConeByAreaRatio(params: ConeInputParams): ConeOutputResult {
    const { initialDiameter, totalAngleDegrees, areaRatio } = params;

    // Валидация входных данных
    if (initialDiameter <= 0) {
        throw new Error('Начальный диаметр должен быть больше 0');
    }
    if (totalAngleDegrees <= 0 || totalAngleDegrees >= 180) {
        throw new Error(
            'Полный угол расширения должен быть в диапазоне от 0 до 180 градусов'
        );
    }
    if (areaRatio <= 1) {
        throw new Error(
            'Отношение площадей для расширяющегося конуса должно быть строго больше 1'
        );
    }

    // 1. Находим отношение диаметров как квадратный корень из отношения площадей
    const diameterRatio = Math.sqrt(areaRatio);

    // 2. Вычисляем конечный диаметр
    const finalDiameter = initialDiameter * diameterRatio;

    // 3. Переводим половину полного угла в радианы
    const halfAngleRadians = ((totalAngleDegrees / 2) * Math.PI) / 180;

    // 4. Находим длину (высоту) конуса
    const height =
        (finalDiameter - initialDiameter) / (2 * Math.tan(halfAngleRadians));

    return {
        height,
        finalDiameter
    };
}

interface ConeHelixParams {
    radius: number; // Начальный радиус (R)
    pitch: number; // Шаг спирали (P)
    height: number; // Высота спирали (H)
    angle?: number; // Угол расширения в градусах (по умолчанию 0 - цилиндр)
}

interface ConeHelixParams {
    radius: number; // Начальный радиус (R)
    pitch: number; // Шаг спирали (P)
    height: number; // Высота спирали (H)
    angle?: number; // Угол расширения в градусах (по умолчанию 0 - цилиндр)
}

/**
 * Вычисляет абсолютно точную длину конической или цилиндрической спирали
 * Проверено математическим моделированием.
 */
function calculateFreeCADHelixLength(params: ConeHelixParams): number {
    const { radius, pitch, height } = params;
    const angleDeg = params.angle ?? 0;

    if (radius <= 0 || pitch <= 0 || height <= 0) {
        throw new Error('Радиус, шаг и высота должны быть больше 0');
    }

    // Если угол 0, считаем по стандартной формуле цилиндра (Теорема Пифагора)
    if (angleDeg === 0) {
        const turns = height / pitch;
        const circumference = 2 * Math.PI * radius;
        return turns * Math.sqrt(Math.pow(circumference, 2) + Math.pow(pitch, 2));
    }

    // --- Корректный расчет для конической спирали ---
    const alpha = (angleDeg * Math.PI) / 180; // Угол в радианах

    // k - скорость изменения радиуса на один радиан поворота
    const k = (pitch * Math.tan(alpha)) / (2 * Math.PI);
    // b - скорость подъема по оси Z на один радиан поворота
    const b = pitch / (2 * Math.PI);

    // Константа интеграла (квадрат гипотенузы шага изменения)
    const A2 = k * k + b * b;

    // Радиус в начале и в конце траектории
    const rStart = radius;
    const rEnd = radius + height * Math.tan(alpha);

    // Первообразная для функции длины дуги вида: integral( sqrt(A2 + u^2) du )
    const getAntiderivative = (u: number): number => {
        const sqrtPart = Math.sqrt(A2 + u * u);
        return 0.5 * (u * sqrtPart + A2 * Math.log(u + sqrtPart));
    };

    // Длина кривой: (F(rEnd) - F(rStart)) / k
    return (getAntiderivative(rEnd) - getAntiderivative(rStart)) / k;
}
