<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Console\Scheduling\Schedule;

class AppServiceProvider extends ServiceProvider
{
    
    public function register(): void
    {

    }

    
    public function boot(): void
    {
        $this->app->booted(function () {
            $schedule = $this->app->make(Schedule::class);
            

            $schedule->command('crypto:update-prices', ['--interval=5'])
                ->everyMinute()
                ->withoutOverlapping()
                ->runInBackground();
        });
    }
}
