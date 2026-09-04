<?php

namespace App\Providers;

use App\Events\AppointmentCancelled;
use App\Events\AppointmentCreated;
use App\Events\AppointmentReminderNeeded;
use App\Listeners\SendAppointmentCancellationEmail;
use App\Listeners\SendAppointmentConfirmationEmail;
use App\Listeners\SendAppointmentReminderEmail;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        AppointmentCreated::class => [
            SendAppointmentConfirmationEmail::class,
            \App\Listeners\SendAppointmentConfirmationSms::class,
        ],
        AppointmentReminderNeeded::class => [
            SendAppointmentReminderEmail::class,
        ],
        AppointmentCancelled::class => [
            SendAppointmentCancellationEmail::class,
            \App\Listeners\SendAppointmentCancellationSms::class,
        ],
    ];

    public function boot(): void
    {
        //
    }
}
