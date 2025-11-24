<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Console\Scheduling\Schedule;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->app->booted(function () {
            $schedule = $this->app->make(Schedule::class);
            
            // Run crypto price updates every minute
            $schedule->command('crypto:update-prices', ['--interval=5'])
                ->everyMinute()
                ->withoutOverlapping()
                ->runInBackground();
        });
    }
}
