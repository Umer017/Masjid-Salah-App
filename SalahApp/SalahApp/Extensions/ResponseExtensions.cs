using SalahApp.DTOs;

namespace SalahApp.Extensions
{
    public static class ApiResponseHelper
    {
        public static ApiResponse<T> ToSuccessResponse<T>(this T data, string message = "Operation successful")
        {
            return new ApiResponse<T>
            {
                Success = true,
                Message = message,
                Data = data,
                Errors = new List<string>()
            };
        }

        public static ApiResponse<T> ToErrorResponse<T>(this T data, string message, List<string>? errors = null)
        {
            return new ApiResponse<T>
            {
                Success = false,
                Message = message,
                Data = data,
                Errors = errors ?? new List<string>()
            };
        }

        public static ApiResponse<T> ToErrorResponse<T>(string message, List<string>? errors = null)
        {
            return new ApiResponse<T>
            {
                Success = false,
                Message = message,
                Data = default,
                Errors = errors ?? new List<string>()
            };
        }

        public static ApiResponse<T> CreateSuccessResponse<T>(T data, string message = "Operation successful")
        {
            return new ApiResponse<T>
            {
                Success = true,
                Message = message,
                Data = data,
                Errors = new List<string>()
            };
        }

        public static ApiResponse<T> CreateErrorResponse<T>(string message, string? error = null)
        {
            var errors = new List<string>();
            if (!string.IsNullOrEmpty(error))
                errors.Add(error);
                
            return new ApiResponse<T>
            {
                Success = false,
                Message = message,
                Data = default,
                Errors = errors
            };
        }

        public static ApiResponse<T> CreateNotFoundResponse<T>(string message)
        {
            return new ApiResponse<T>
            {
                Success = false,
                Message = message,
                Data = default,
                Errors = new List<string> { "Resource not found" }
            };
        }

        public static PagedResponse<T> ToPagedResponse<T>(this IEnumerable<T> data, int totalCount, int pageNumber, int pageSize)
        {
            return new PagedResponse<T>
            {
                Data = data.ToList(),
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }
    }
}