import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL as string;

interface SubscriptionData {
  email: string;
  planId: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const requestData: SubscriptionData = await request.json();
    const result = await axios.post(API_GATEWAY_URL, requestData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return NextResponse.json(result.data, {
      status: result.status,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        error.response?.data || { message: "An error occurred" },
        {
          status: error.response?.status || 500,
        }
      );
    }
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const email = decodeURIComponent(searchParams.get("email") as string);
    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }
    const result = await axios.get(`${API_GATEWAY_URL}?email=${email}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return NextResponse.json(result.data, {
      status: result.status,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        error.response?.data || { message: "An error occurred" },
        {
          status: error.response?.status || 500,
        }
      );
    }
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const data = await request.json();
    const result = await axios.post(API_GATEWAY_URL + "/cancel", data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return NextResponse.json(result.data, {
      status: result.status,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        error.response?.data || { message: "An error occurred" },
        {
          status: error.response?.status || 500,
        }
      );
    }
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 }
    );
  }
}
