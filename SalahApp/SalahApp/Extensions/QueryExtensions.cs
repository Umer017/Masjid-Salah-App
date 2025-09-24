using Microsoft.EntityFrameworkCore;

namespace SalahApp.Extensions
{
    public static class QueryableExtensions
    {
        public static async Task<(List<T> Data, int TotalCount)> ToPagedListAsync<T>(
            this IQueryable<T> query,
            int pageNumber,
            int pageSize,
            CancellationToken cancellationToken = default)
        {
            var totalCount = await query.CountAsync(cancellationToken);
            var items = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            return (items, totalCount);
        }

        public static IQueryable<T> ApplyPagination<T>(this IQueryable<T> query, int pageNumber, int pageSize)
        {
            return query.Skip((pageNumber - 1) * pageSize).Take(pageSize);
        }
    }

    public static class LocationExtensions
    {
        // Haversine formula to calculate distance between two coordinates
        public static double CalculateDistance(decimal lat1, decimal lon1, decimal lat2, decimal lon2)
        {
            const double R = 6371; // Earth's radius in kilometers

            var dLat = ToRadians((double)(lat2 - lat1));
            var dLon = ToRadians((double)(lon2 - lon1));

            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(ToRadians((double)lat1)) * Math.Cos(ToRadians((double)lat2)) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            var distance = R * c;

            return distance;
        }

        private static double ToRadians(double degrees)
        {
            return degrees * (Math.PI / 180);
        }

        public static IQueryable<T> WhereWithinRadius<T>(
            this IQueryable<T> query,
            decimal centerLat,
            decimal centerLon,
            double radiusInKm,
            Func<T, decimal?> getLatitude,
            Func<T, decimal?> getLongitude)
        {
            return query.AsEnumerable()
                .Where(item =>
                {
                    var lat = getLatitude(item);
                    var lon = getLongitude(item);
                    
                    if (!lat.HasValue || !lon.HasValue)
                        return false;
                    
                    var distance = CalculateDistance(centerLat, centerLon, lat.Value, lon.Value);
                    return distance <= radiusInKm;
                })
                .AsQueryable();
        }
    }
}