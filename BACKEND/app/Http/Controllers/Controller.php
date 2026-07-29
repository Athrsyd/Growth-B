<?php

namespace App\Http\Controllers;

abstract class Controller
{
    public function success($msg = '', $data = null, $status = 200)
    {
        $responses = [];
        if ($msg) {
            $responses['message'] = $msg;
        }
        if ($data) {
            $responses = array_merge($responses, $data);
        }

        return response()->json($responses, $status);
    }
    public function error($msg = '', $status = 400)
    {
        $responses = [];
        if ($msg) {
            $responses['message'] = $msg;
        }

        return response()->json($responses, $status);
    }
}
