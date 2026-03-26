import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const userId = request.headers.get('X-Replit-User-Id');
  const userName = request.headers.get('X-Replit-User-Name');
  const userBio = request.headers.get('X-Replit-User-Bio');
  const userUrl = request.headers.get('X-Replit-User-Url');
  const userProfileImage = request.headers.get('X-Replit-User-Profile-Image');
  const userRoles = request.headers.get('X-Replit-User-Roles');

  if (!userId) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: {
      id: userId,
      name: userName,
      bio: userBio,
      url: userUrl,
      profileImage: userProfileImage,
      roles: userRoles,
    },
  });
}
