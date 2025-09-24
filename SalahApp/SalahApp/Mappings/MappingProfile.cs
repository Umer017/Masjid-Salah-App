using AutoMapper;
using SalahApp.DTOs;
using SalahApp.Models;

namespace SalahApp.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Admin mappings
            CreateMap<Admin, AdminDto>();
            CreateMap<CreateAdminDto, Admin>()
                .ForMember(dest => dest.PasswordHash, opt => opt.MapFrom(src => BCrypt.Net.BCrypt.HashPassword(src.Password)));
            CreateMap<UpdateAdminDto, Admin>()
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            // State mappings
            CreateMap<State, StateDto>()
                .ForMember(dest => dest.Cities, opt => opt.MapFrom(src => src.Cities));
            CreateMap<CreateStateDto, State>();
            CreateMap<UpdateStateDto, State>()
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            // City mappings
            CreateMap<City, CityDto>()
                .ForMember(dest => dest.StateName, opt => opt.MapFrom(src => src.State.StateName))
                .ForMember(dest => dest.Masjids, opt => opt.MapFrom(src => src.Masjids));
            CreateMap<CreateCityDto, City>();
            CreateMap<UpdateCityDto, City>()
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            // Masjid mappings
            CreateMap<Masjid, MasjidDto>()
                .ForMember(dest => dest.CityName, opt => opt.MapFrom(src => src.City.CityName))
                .ForMember(dest => dest.StateName, opt => opt.MapFrom(src => src.City.State.StateName));
            CreateMap<CreateMasjidDto, Masjid>();
            CreateMap<UpdateMasjidDto, Masjid>()
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));
            CreateMap<Masjid, MasjidWithTimingsDto>()
                .ForMember(dest => dest.CityName, opt => opt.MapFrom(src => src.City.CityName))
                .ForMember(dest => dest.StateName, opt => opt.MapFrom(src => src.City.State.StateName))
                .ForMember(dest => dest.SalahTimings, opt => opt.MapFrom(src => src.SalahTimings))
                .ForMember(dest => dest.AdditionalTimings, opt => opt.MapFrom(src => src.DailyAdditionalTimings))
                .ForMember(dest => dest.SpecialEvents, opt => opt.MapFrom(src => src.SpecialEvents));

            // SalahTiming mappings
            CreateMap<SalahTiming, SalahTimingDto>()
                .ForMember(dest => dest.MasjidName, opt => opt.MapFrom(src => src.Masjid.MasjidName));
            CreateMap<CreateSalahTimingDto, SalahTiming>();
            CreateMap<UpdateSalahTimingDto, SalahTiming>()
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            // DailyAdditionalTimings mappings
            CreateMap<DailyAdditionalTimings, DailyAdditionalTimingsDto>()
                .ForMember(dest => dest.MasjidName, opt => opt.MapFrom(src => src.Masjid.MasjidName));
            CreateMap<CreateDailyAdditionalTimingsDto, DailyAdditionalTimings>();
            CreateMap<UpdateDailyAdditionalTimingsDto, DailyAdditionalTimings>()
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            // SpecialEvents mappings
            CreateMap<SpecialEvents, SpecialEventsDto>()
                .ForMember(dest => dest.MasjidName, opt => opt.MapFrom(src => src.Masjid.MasjidName));
            CreateMap<CreateSpecialEventsDto, SpecialEvents>();
            CreateMap<UpdateSpecialEventsDto, SpecialEvents>()
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            // DefaultSchedule mappings
            CreateMap<DefaultSchedule, DefaultScheduleDto>()
                .ForMember(dest => dest.MasjidName, opt => opt.MapFrom(src => src.Masjid.MasjidName));
            CreateMap<CreateDefaultScheduleDto, DefaultSchedule>();
            CreateMap<UpdateDefaultScheduleDto, DefaultSchedule>()
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));
        }
    }
}